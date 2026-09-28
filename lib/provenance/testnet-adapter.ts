import type {
  ProvenanceRecord,
  VerificationResult,
} from "@/lib/provenance/types";
import type { ChainAdapter, ChainSubmitInput } from "@/lib/provenance/adapter";
import { resolveAdapterConfig } from "@/lib/provenance/adapter";
import { getRegisteredRecordHash } from "@/lib/provenance/local-adapter";
import {
  Contract,
  FetchRequest,
  JsonRpcProvider,
  Wallet,
  keccak256,
  toUtf8Bytes,
  type ContractTransactionReceipt,
} from "ethers";

/**
 * BLOCKCHAIN VERIFICATION ADAPTER — REAL IMPLEMENTATION (ethers v6).
 *
 * Enabled ONLY when PROVENANCE_ADAPTER=testnet AND chain/network/contract/
 * RPC/signer configuration is present. Server-side only — the private key
 * and RPC credentials never leave this module, and the browser bundle
 * never sees them.
 *
 * Honest-by-construction rules enforced here:
 *  - transactionHash is set ONLY from a real transaction receipt.
 *  - BLOCKCHAIN VERIFIED is returned ONLY when the configured contract
 *    confirms the record hash is anchored on-chain.
 *  - any failure returns a clearly-labeled unavailable/failed result —
 *    the record remains locally verified and nothing is fabricated.
 *
 * The chain client is behind a minimal seam (MinimalChainClient) so tests
 * can mock submission/verification without a network; production injects
 * the ethers-backed client. Adding the real client touches exactly this
 * file — UI, provider, and API routes stay unchanged.
 */

/** ABI for the minimal ProvenanceAnchor contract (docs/blockchain/). */
export const PROVENANCE_ANCHOR_ABI = [
  "function anchor(bytes32 recordHash, bytes32 recordId) external",
  "event RecordAnchored(bytes32 indexed recordHash, bytes32 indexed recordId, uint256 timestamp, address indexed submitter)",
  "function isAnchored(bytes32 recordHash) external view returns (bool)",
  "function commitTimestamp(bytes32 recordHash) external view returns (uint256)",
] as const;

export class BlockchainAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockchainAdapterError";
  }
}

/** User-facing unavailable wording (also asserted by the verify suites). */
export const BLOCKCHAIN_UNAVAILABLE_MESSAGE =
  "Blockchain anchoring is unavailable. The record remains locally verified.";

/** Hash the record/event id for on-chain use — raw ids never go on-chain. */
export function toRecordIdHash(eventId: string): string {
  return keccak256(toUtf8Bytes(eventId));
}

/* ------------------------------------------------------------------ */
/* Minimal chain-client seam (mockable; ethers-backed in production)  */
/* ------------------------------------------------------------------ */

export interface AnchorReceipt {
  /** Real transaction hash from a mined receipt. */
  transactionHash: string;
  blockNumber: number;
  /** Contract-provided commit timestamp (seconds). */
  committedAtSeconds: number;
}

export interface MinimalChainClient {
  /** Submit the anchor transaction and wait for a mined receipt. */
  submitAnchor(recordHash: string, recordIdHash: string): Promise<AnchorReceipt>;
  /** Query the contract: is this exact record hash anchored? */
  isAnchored(recordHash: string): Promise<boolean>;
}

/** A transaction hash must look like a real 32-byte tx hash. */
const TX_HASH_PATTERN = /^0x[0-9a-fA-F]{64}$/;

/**
 * Reject malformed receipts — a fabricated or corrupt client response must
 * never become a "verified" record (never trust, always validate).
 */
function validateReceipt(receipt: AnchorReceipt): AnchorReceipt {
  if (
    typeof receipt !== "object" ||
    receipt === null ||
    typeof receipt.transactionHash !== "string" ||
    !TX_HASH_PATTERN.test(receipt.transactionHash) ||
    typeof receipt.blockNumber !== "number" ||
    !Number.isInteger(receipt.blockNumber) ||
    receipt.blockNumber < 0 ||
    typeof receipt.committedAtSeconds !== "number" ||
    !Number.isFinite(receipt.committedAtSeconds)
  ) {
    throw new BlockchainAdapterError(
      "Malformed anchor receipt from the chain client — the transaction result is not usable."
    );
  }
  return receipt;
}

/* ------------------------------------------------------------------ */
/* ethers-backed client (production)                                   */
/* ------------------------------------------------------------------ */

function createEthersChainClient(): MinimalChainClient {
  const cfg = resolveAdapterConfig();
  const rpcEndpoint = cfg.endpoint;
  const contractAddress = cfg.contractAddress;
  const privateKey = process.env.PROVENANCE_PRIVATE_KEY;

  if (!rpcEndpoint || !contractAddress || !privateKey) {
    throw new BlockchainAdapterError(
      "Blockchain adapter is not fully configured (adapter/chain/network/contract/rpc/signer)."
    );
  }

  // Optional RPC API key is attached as a bearer header via ethers'
  // FetchRequest — it stays server-side, inside this module only.
  const fetchRequest = new FetchRequest(rpcEndpoint);
  if (cfg.apiKey) {
    fetchRequest.setHeader("authorization", `Bearer ${cfg.apiKey}`);
  }
  const provider = new JsonRpcProvider(fetchRequest);
  const signer = new Wallet(privateKey, provider);
  const contract = new Contract(contractAddress, [...PROVENANCE_ANCHOR_ABI], signer);

  return {
    async submitAnchor(recordHash, recordIdHash) {
      const tx = await contract.anchor(recordHash, recordIdHash);
      let receipt: ContractTransactionReceipt | null = null;
      try {
        receipt = await tx.wait(1);
      } catch {
        throw new BlockchainAdapterError(
          "Anchor transaction was broadcast but the receipt could not be retrieved."
        );
      }
      if (!receipt) {
        throw new BlockchainAdapterError(
          "Anchor transaction has no receipt yet — the anchor may still be pending."
        );
      }
      if (receipt.status === 0) {
        throw new BlockchainAdapterError(
          "Anchor transaction reverted on-chain."
        );
      }
      const committedAtSeconds = await contract.commitTimestamp(recordHash);
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        committedAtSeconds: Number(committedAtSeconds),
      };
    },

    async isAnchored(recordHash) {
      const anchored: boolean = await contract.isAnchored(recordHash);
      return anchored;
    },
  };
}

/* Production client cache — built once per server process, after config. */
let cachedClient: MinimalChainClient | null = null;
let clientOverride: MinimalChainClient | null = null;

/** Test hook — inject a mock chain client (restored via null). */
export function __setChainClientOverride(client: MinimalChainClient | null): void {
  clientOverride = client;
  cachedClient = null;
}

/** Test hook — drop the cached production client (config changes). */
export function __clearEthersClientCacheForTests(): void {
  cachedClient = null;
}

function getChainClient(): MinimalChainClient {
  if (clientOverride) return clientOverride;
  if (!cachedClient) {
    cachedClient = createEthersChainClient();
  }
  return cachedClient;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

export function isBlockchainConfigured(): boolean {
  const cfg = resolveAdapterConfig();
  return (
    process.env.PROVENANCE_ADAPTER === "testnet" &&
    cfg.chain !== "local" &&
    cfg.network !== "in-app" &&
    Boolean(cfg.contractAddress) &&
    Boolean(cfg.endpoint) &&
    Boolean(process.env.PROVENANCE_PRIVATE_KEY)
  );
}

export function isBlockchainAnchoringAvailable(): boolean {
  return isBlockchainConfigured();
}

/* ------------------------------------------------------------------ */
/* Adapter                                                             */
/* ------------------------------------------------------------------ */

export function createBlockchainVerificationAdapter(): ChainAdapter {
  const cfg = resolveAdapterConfig();

  return {
    name: "blockchain-verification",
    chain: cfg.chain,
    network: cfg.network,

    async submit(input: ChainSubmitInput): Promise<ProvenanceRecord> {
      if (!isBlockchainConfigured()) {
        throw new BlockchainAdapterError(
          "Blockchain adapter is not fully configured (adapter/chain/network/contract/rpc/signer)."
        );
      }

      const now = new Date().toISOString();
      const registeredAt = getRegisteredRecordHash(input.recordHash);
      const baseRecord = {
        id: `prov-chain-${input.recordHash.slice(0, 16)}`,
        eventId: input.metadata.eventId ?? "",
        canonicalPayloadHash: input.recordHash,
        chain: cfg.chain,
        network: cfg.network,
        contractAddress: cfg.contractAddress,
        createdAt: registeredAt?.at ?? now,
        source: "BLOCKCHAIN" as const,
      };

      try {
        const client = getChainClient();
        const receipt = validateReceipt(
          await client.submitAnchor(
            input.recordHash,
            toRecordIdHash(baseRecord.eventId)
          )
        );

        const record: ProvenanceRecord = {
          ...baseRecord,
          status: "blockchain-verified",
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          anchoredAt: new Date(receipt.committedAtSeconds * 1000).toISOString(),
          reason:
            "Canonical record hash anchored on-chain via the ProvenanceAnchor contract and confirmed by transaction receipt.",
        };
        return record;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown chain error";

        // Duplicate anchoring: the hash is already on-chain — idempotent
        // success with the EXISTING registration data (nothing fabricated).
        if (message.toLowerCase().includes("alreadyanchored") || message.toLowerCase().includes("already anchored")) {
          if (registeredAt?.record.transactionHash) {
            return {
              ...baseRecord,
              status: "blockchain-verified",
              transactionHash: registeredAt.record.transactionHash,
              blockNumber: registeredAt.record.blockNumber,
              anchoredAt: registeredAt.record.anchoredAt,
              reason:
                "This record hash was already anchored on-chain — the existing on-chain record is the proof (no duplicate transaction needed).",
            };
          }
          return {
            ...baseRecord,
            status: "pending",
            reason:
              "The contract reports this hash as already anchored; the original transaction details are not available in this session.",
          };
        }

        // Any submission failure (RPC, funds, gas, nonce, chain mismatch,
        // revert, timeout) means NO confirmed transaction exists — the
        // honest result is failure, never pending and never a fabricated
        // hash. The record remains locally verified upstream.
        throw new BlockchainAdapterError(message);
      }
    },

    async verify(record: ProvenanceRecord): Promise<VerificationResult> {
      const verifiedAt = new Date().toISOString();

      // Step 1 — local integrity: the record hash must still be the one
      // registered when the record was created.
      const registered = getRegisteredRecordHash(record.canonicalPayloadHash);
      if (!registered) {
        return {
          verified: false,
          recordHash: record.canonicalPayloadHash,
          network: record.network,
          reason:
            "Record hash not found in the local registry — the record was altered or never registered.",
          verifiedAt,
          source: "LOCAL",
        };
      }

      if (!isBlockchainConfigured()) {
        return {
          verified: false,
          recordHash: record.canonicalPayloadHash,
          network: record.network,
          reason: `${BLOCKCHAIN_UNAVAILABLE_MESSAGE} (adapter not configured.)`,
          verifiedAt,
          source: "LOCAL",
        };
      }

      // Step 2 — on-chain verification: query the configured contract.
      try {
        const client = getChainClient();
        const anchored = await client.isAnchored(record.canonicalPayloadHash);
        if (anchored) {
          return {
            verified: true,
            recordHash: record.canonicalPayloadHash,
            transactionHash: record.transactionHash,
            network: record.network,
            contractAddress: record.contractAddress,
            reason:
              "Record hash confirmed on-chain by the ProvenanceAnchor contract, and the local hash matches the registered canonical hash.",
            verifiedAt,
            source: "BLOCKCHAIN",
          };
        }
        return {
          verified: false,
          recordHash: record.canonicalPayloadHash,
          network: record.network,
          contractAddress: record.contractAddress,
          reason:
            "The configured contract does not show this record hash as anchored. The record remains locally verified.",
          verifiedAt,
          source: "BLOCKCHAIN",
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown chain error";
        return {
          verified: false,
          recordHash: record.canonicalPayloadHash,
          network: record.network,
          reason: `${BLOCKCHAIN_UNAVAILABLE_MESSAGE} (${message})`,
          verifiedAt,
          source: "LOCAL",
        };
      }
    },
  };
}
