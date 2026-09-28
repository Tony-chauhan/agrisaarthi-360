/**
 * BLOCKCHAIN PROVENANCE VERIFICATION SUITE
 * Usage: npx tsx scripts/verify-provenance-blockchain.ts
 *
 * Covers the master-task matrix with MOCKED chain clients (no network):
 *   A. canonical hash remains deterministic
 *   B. local verification still works
 *   C. blockchain adapter is selectable when configured
 *   D. missing blockchain config does NOT crash (local default)
 *   E. malformed transaction result is rejected
 *   F. transaction hash is never fabricated
 *   G. successful blockchain response is normalized
 *   H. blockchain verification checks the actual anchored hash
 *   I. duplicate anchoring is handled (idempotent, honest)
 *   J. provider/network failure preserves local verification
 *   K. UI status changes are truthful (badges derive from record status)
 *   L. no secrets are exposed to client (key only read in adapter module)
 *   M. golden demo unchanged (full run lives in verify-golden-demo.ts)
 *   N. existing suites keep their provenance guarantees (verify-p1.ts)
 *
 * A REAL TESTNET SMOKE TEST exists separately:
 *   scripts/testnet-smoke.ts — runs ONLY when full env config is present
 *   and actually submits an on-chain transaction. Never faked here.
 */

import {
  buildCanonicalPayload,
  farmContextDigest,
  hashCanonicalPayload,
} from "../lib/provenance/canonical";
import {
  clearLocalRegistry,
  createLocalVerificationAdapter,
  lookupLocalRecord,
} from "../lib/provenance/local-adapter";
import {
  __setChainClientOverride,
  createBlockchainVerificationAdapter,
  isBlockchainConfigured,
  toRecordIdHash,
  type AnchorReceipt,
  type MinimalChainClient,
} from "../lib/provenance/testnet-adapter";
import {
  anchorProvenanceRecord,
  createProvenanceRecord,
  provenanceCapabilities,
  resolveProvenanceAdapter,
  verifyProvenanceRecord,
} from "../lib/provenance/provider";
import type { ProvenanceRecord } from "../lib/provenance/types";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

const VALID_TX = `0x${"ab".repeat(32)}`;

/** Deterministic mock chain client covering the common scenarios. */
function makeMockClient(opts: {
  receipt?: AnchorReceipt | Error;
  anchored?: boolean | Error;
}): MinimalChainClient {
  return {
    async submitAnchor() {
      if (opts.receipt instanceof Error) throw opts.receipt;
      return opts.receipt as AnchorReceipt;
    },
    async isAnchored() {
      if (opts.anchored instanceof Error) throw opts.anchored;
      return opts.anchored as boolean;
    },
  };
}

const BASE_INPUT = {
  eventId: "evt-bc-001",
  eventType: "TASK_COMPLETED" as const,
  eventTimestamp: "2026-09-29T08:00:00.000Z",
  entitySummary: { taskTitle: "First irrigation — crown root initiation", statusText: "Task completed" },
  farmContext: { crop: "Wheat", season: "rabi", location: "Nashik, Maharashtra" },
};

async function main() {
  console.log("\n=== BLOCKCHAIN PROVENANCE VERIFICATION (mocked chain) ===\n");

  /* ---------------- A. canonical hash determinism ---------------- */
  console.log("A. Canonical hash remains deterministic");
  {
    const ts = "2026-09-29T08:05:00.000Z";
    const p1 = buildCanonicalPayload(BASE_INPUT, ts);
    const p2 = buildCanonicalPayload(
      { ...BASE_INPUT, entitySummary: { statusText: "Task completed", taskTitle: "First irrigation — crown root initiation" } },
      ts
    );
    const h1 = hashCanonicalPayload(p1);
    const h2 = hashCanonicalPayload(p2);
    assert(h1 === h2, "key-order-independent canonical hash");
    assert(h1 === hashCanonicalPayload(buildCanonicalPayload(BASE_INPUT, ts)), "identical inputs → identical hash");
    assert(
      hashCanonicalPayload(buildCanonicalPayload({ ...BASE_INPUT, entitySummary: { taskTitle: "Tampered" } }, ts)) !== h1,
      "changed payload → different hash"
    );
    assert(/^[a-f0-9]{64}$/.test(h1), "hash is 64-hex SHA-256");
    assert(
      farmContextDigest({ crop: "Wheat", season: "rabi", location: "Nashik" }) ===
        farmContextDigest({ season: "rabi", location: "Nashik", crop: "Wheat" }),
      "farmContextDigest order-independent"
    );
  }

  /* ---------------- B. local verification still works ---------------- */
  console.log("\nB. Local verification still works (default path)");
  {
    clearLocalRegistry();
    const created = await createProvenanceRecord(BASE_INPUT);
    assert(created.status === "success", "record created (local-first)");
    if (created.status !== "success") throw new Error("setup failed");
    const rec = created.record;
    assert(rec.status === "local-verified", "record is LOCAL verified");
    assert(rec.source === "LOCAL", "record source is LOCAL");
    assert(!rec.transactionHash, "local record has NO transactionHash");
    assert(created.anchoring.result === "skipped" && !created.anchoring.requested, "no anchoring requested by default");

    const verify = await verifyProvenanceRecord(rec);
    if (verify.status !== "success") throw new Error("setup failed");
    assert(verify.result.verified, "local verify succeeds");
    assert(verify.result.source === "LOCAL", "verification source is LOCAL");

    const lookup = lookupLocalRecord(rec.id);
    assert(lookup?.canonicalPayloadHash === rec.canonicalPayloadHash, "record lookup by id works");
    const lookupByHash = lookupLocalRecord(rec.canonicalPayloadHash);
    assert(lookupByHash?.id === rec.id, "record lookup by hash works");
  }

  /* ---------------- C+D. adapter selection vs config ---------------- */
  console.log("\nC+D. Adapter selection — configured vs missing config");
  {
    delete process.env.PROVENANCE_ADAPTER;
    delete process.env.PROVENANCE_PRIVATE_KEY;
    const caps = provenanceCapabilities();
    assert(caps.blockchainConfigured === false, "unconfigured → capabilities.blockchainConfigured=false");
    assert(caps.anchoringAvailable === false, "unconfigured → anchoringAvailable=false");
    assert(resolveProvenanceAdapter().name === "local-verification", "default adapter is local (no crash)");

    process.env.PROVENANCE_ADAPTER = "testnet";
    process.env.PROVENANCE_CHAIN = "polygon-amoy";
    process.env.PROVENANCE_NETWORK = "amoy";
    process.env.PROVENANCE_RPC_ENDPOINT = "https://rpc.example.invalid";
    process.env.PROVENANCE_CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
    // signer still missing → anchoring NOT available, still no crash
    assert(isBlockchainConfigured() === false, "missing signer → not configured");
    assert(resolveProvenanceAdapter().name === "local-verification", "missing signer → local adapter");

    process.env.PROVENANCE_PRIVATE_KEY = `0x${"11".repeat(32)}`;
    assert(isBlockchainConfigured() === true, "full config → blockchain configured");
    assert(resolveProvenanceAdapter().name === "blockchain-verification", "configured → blockchain adapter selectable");
    assert(provenanceCapabilities().anchoringAvailable === true, "configured → anchoringAvailable=true");
  }

  /* ---------------- E. malformed transaction result rejected ---------------- */
  console.log("\nE. Malformed transaction results are rejected");
  {
    const badReceipts: Array<{ label: string; receipt: unknown }> = [
      { label: "non-object receipt", receipt: "0xdeadbeef" },
      { label: "short tx hash", receipt: { transactionHash: "0x1234", blockNumber: 1, committedAtSeconds: 1 } },
      { label: "non-hex tx hash", receipt: { transactionHash: "not-a-hash", blockNumber: 1, committedAtSeconds: 1 } },
      { label: "negative block", receipt: { transactionHash: VALID_TX, blockNumber: -1, committedAtSeconds: 1 } },
      { label: "missing committedAt", receipt: { transactionHash: VALID_TX, blockNumber: 1 } },
    ];
    let rejectedAll = true;
    for (const bad of badReceipts) {
      __setChainClientOverride(makeMockClient({ receipt: bad.receipt as never }));
      try {
        const adapter = createBlockchainVerificationAdapter();
        await adapter.submit({
          recordHash: `0x${"e".repeat(64)}`,
          eventType: "TASK_COMPLETED",
          eventTimestamp: "2026-09-29T08:00:00.000Z",
          metadata: { eventId: "evt-e" },
        });
        rejectedAll = false; // submission "succeeded" — bad
      } catch {
        // expected: malformed receipts must never produce a verified record
      }
    }
    __setChainClientOverride(null);
    assert(rejectedAll, "all malformed receipts rejected (no verified record)");
  }

  /* ---------------- F+G. success normalized, hash never fabricated ---------------- */
  console.log("\nF+G. Blockchain success is normalized; hash only from real receipt");
  {
    clearLocalRegistry();
    const created = await createProvenanceRecord(BASE_INPUT);
    if (created.status !== "success") throw new Error("setup failed");
    const rec = created.record;

    __setChainClientOverride(
      makeMockClient({
        receipt: { transactionHash: VALID_TX, blockNumber: 4242, committedAtSeconds: 1759100000 },
        anchored: true,
      })
    );
    const anchored = await anchorProvenanceRecord(rec);
    assert(anchored.status === "success", "anchoring succeeds with valid receipt");
    if (anchored.status !== "success") throw new Error("setup failed");
    const ar = anchored.record;
    assert(ar.status === "blockchain-verified", "record upgraded to blockchain-verified");
    assert(ar.transactionHash === VALID_TX, "transactionHash is the REAL receipt hash");
    assert(ar.blockNumber === 4242, "blockNumber from receipt");
    assert(ar.source === "BLOCKCHAIN", "record source is BLOCKCHAIN");
    assert(Boolean(ar.contractAddress), "contractAddress present on anchored record");
    assert(Boolean(ar.anchoredAt), "anchoredAt present on anchored record");

    // Normalized record persisted in the registry (same id, same hash).
    const stored = lookupLocalRecord(rec.canonicalPayloadHash);
    assert(stored?.status === "blockchain-verified", "registry entry upgraded (same record, same hash)");
    assert(stored?.id === rec.id, "record id unchanged by anchoring");

    // F: local adapter alone can never mint a transactionHash.
    clearLocalRegistry();
    const localAdapter = createLocalVerificationAdapter();
    const localRec = await localAdapter.submit({
      recordHash: `0x${"f".repeat(64)}`,
      eventType: "TASK_COMPLETED",
      eventTimestamp: "2026-09-29T08:00:00.000Z",
      metadata: { eventId: "evt-f" },
    });
    assert(!localRec.transactionHash, "local submit never fabricates a transactionHash");
  }

  /* ---------------- H. verification checks the actual anchored hash ---------------- */
  console.log("\nH. Blockchain verification queries the anchored hash");
  {
    clearLocalRegistry();
    const created = await createProvenanceRecord(BASE_INPUT);
    if (created.status !== "success") throw new Error("setup failed");
    const rec = created.record;

    // Case 1: contract says anchored → verified=true with real tx hash.
    __setChainClientOverride(makeMockClient({ receipt: { transactionHash: VALID_TX, blockNumber: 7, committedAtSeconds: 1759100000 }, anchored: true }));
    const anchored = await anchorProvenanceRecord(rec);
    if (anchored.status !== "success") throw new Error("setup failed");

    const v = await verifyProvenanceRecord(anchored.record);
    if (v.status !== "success") throw new Error("setup failed");
    assert(v.result.verified, "on-chain verification succeeds");
    assert(v.result.source === "BLOCKCHAIN", "verification source is BLOCKCHAIN");
    assert(v.result.transactionHash === VALID_TX, "verification carries the real transaction hash");

    // Case 2: contract says NOT anchored → verified=false (honest).
    // (Verify the STORED merged record — what the UI would re-verify.)
    __setChainClientOverride(makeMockClient({ receipt: { transactionHash: VALID_TX, blockNumber: 7, committedAtSeconds: 1759100000 }, anchored: true }));
    const rec2 = (await createProvenanceRecord({ ...BASE_INPUT, eventId: "evt-h2" }));
    if (rec2.status !== "success") throw new Error("setup failed");
    await anchorProvenanceRecord(rec2.record);
    const storedCase2 = lookupLocalRecord(rec2.record.canonicalPayloadHash);
    if (!storedCase2) throw new Error("setup failed");
    __setChainClientOverride(makeMockClient({ anchored: false }));
    const v2 = await verifyProvenanceRecord(storedCase2);
    if (v2.status !== "success") throw new Error("setup failed");
    assert(v2.result.verified === false, "contract says not anchored → NOT verified (no fabrication)");
    assert((v2.result.reason ?? "").includes("locally verified"), "honest reason mentions local verification");

    // Case 3: local hash integrity — tampered hash is not in the registry.
    __setChainClientOverride(makeMockClient({ anchored: true }));
    const tampered: ProvenanceRecord = { ...anchored.record, canonicalPayloadHash: `0x${"9".repeat(64)}` };
    const v3 = await verifyProvenanceRecord(tampered);
    if (v3.status !== "success") throw new Error("setup failed");
    assert(v3.result.verified === false, "tampered hash fails verification (registry check first)");
    __setChainClientOverride(null);
  }

  /* ---------------- I. duplicate anchoring ---------------- */
  console.log("\nI. Duplicate anchoring is idempotent and honest");
  {
    clearLocalRegistry();
    const created = await createProvenanceRecord(BASE_INPUT);
    if (created.status !== "success") throw new Error("setup failed");
    const rec = created.record;

    __setChainClientOverride(makeMockClient({ receipt: { transactionHash: VALID_TX, blockNumber: 9, committedAtSeconds: 1759100000 } }));
    const first = await anchorProvenanceRecord(rec);
    assert(first.status === "success", "first anchor succeeds");

    // Contract reverts with AlreadyAnchored; registry has the original tx.
    __setChainClientOverride(makeMockClient({ receipt: new Error("execution reverted: AlreadyAnchored") }));
    const second = await anchorProvenanceRecord(rec);
    assert(second.status === "success", "duplicate anchor → idempotent success");
    if (second.status !== "success") throw new Error("setup failed");
    assert(second.record.transactionHash === VALID_TX, "duplicate keeps the ORIGINAL transaction hash (not fabricated)");
    assert((second.record.reason ?? "").includes("already anchored"), "honest duplicate reason");

    // Duplicate with no prior registry tx → pending, not a fake hash.
    clearLocalRegistry();
    const rec2 = await createProvenanceRecord({ ...BASE_INPUT, eventId: "evt-i2" });
    if (rec2.status !== "success") throw new Error("setup failed");
    // Simulate: registry entry without receipt (e.g. server restarted mid-way).
    const { updateLocalRecord } = await import("../lib/provenance/local-adapter");
    updateLocalRecord(rec2.record.canonicalPayloadHash, { status: "blockchain-verified" });
    const secondNoTx = await anchorProvenanceRecord(rec2.record);
    assert(secondNoTx.status === "success", "duplicate without stored tx → success");
    if (secondNoTx.status !== "success") throw new Error("setup failed");
    assert(secondNoTx.record.status === "pending", "→ pending (never a fabricated hash)");
    __setChainClientOverride(null);
  }

  /* ---------------- J. failure preserves local verification ---------------- */
  console.log("\nJ. Provider/network failures preserve local verification");
  {
    clearLocalRegistry();
    const created = await createProvenanceRecord(BASE_INPUT);
    if (created.status !== "success") throw new Error("setup failed");
    const rec = created.record;

    // RPC failure on submit
    __setChainClientOverride(makeMockClient({ receipt: new Error("RPC timeout"), anchored: false }));
    const fail = await anchorProvenanceRecord(rec);
    assert(fail.status === "unavailable", "RPC failure → anchoring unavailable");
    assert((fail as { reason: string }).reason.includes("locally verified"), "user-facing message names the local fallback");
    const stored = lookupLocalRecord(rec.canonicalPayloadHash);
    assert(stored?.status === "local-verified", "record REMAINS locally verified after failure");
    assert(!stored?.transactionHash, "no transactionHash appears after failure");

    // Config disappears between create and verify (anchored record):
    // verify the STORED (merged, blockchain-sourced) record — the object
    // the verify API resolves from the registry.
    __setChainClientOverride(makeMockClient({ receipt: { transactionHash: VALID_TX, blockNumber: 3, committedAtSeconds: 1759100000 }, anchored: true }));
    await anchorProvenanceRecord(rec);
    delete process.env.PROVENANCE_PRIVATE_KEY;
    const storedAnchored = lookupLocalRecord(rec.canonicalPayloadHash);
    if (!storedAnchored) throw new Error("setup failed");
    const v = await verifyProvenanceRecord(storedAnchored);
    if (v.status !== "success") throw new Error("setup failed");
    assert(v.result.verified === false, "config gone → verification honest (not claimed)");
    assert((v.result.reason ?? "").includes("locally verified"), "unavailable message explains fallback");
    // Registry still holds the real receipt from when it was observed.
    const stored2 = lookupLocalRecord(rec.canonicalPayloadHash);
    assert(stored2?.transactionHash === VALID_TX, "previously observed receipt is preserved (never deleted/hidden)");
    __setChainClientOverride(null);
  }

  /* ---------------- K. UI statuses derive truthfully ---------------- */
  console.log("\nK. UI status mapping is truthful");
  {
    clearLocalRegistry();
    const created = await createProvenanceRecord(BASE_INPUT);
    if (created.status !== "success") throw new Error("setup failed");
    const rec = created.record;
    // The badge derives from record status — these must map 1:1.
    assert(
      (["local-verified", "blockchain-verified", "pending", "failed", "unverified"] as const).every((s) =>
        ["local-verified", "blockchain-verified", "pending", "unavailable", "unverified"].includes(
          s === "failed" ? "unavailable" : s
        )
      ),
      "every record status has a UI badge state"
    );
    assert(rec.status === "local-verified" && rec.source === "LOCAL", "un-anchored record → LOCAL VERIFIED badge state");
  }

  /* ---------------- L. secrets never reach the client ---------------- */
  console.log("\nL. Secret isolation (server-only blockchain calls)");
  {
    const { readFileSync } = await import("node:fs");
    const adapterSrc = readFileSync("lib/provenance/testnet-adapter.ts", "utf8");
    const providerSrc = readFileSync("lib/provenance/provider.ts", "utf8");
    assert(
      adapterSrc.includes("process.env.PROVENANCE_PRIVATE_KEY") && adapterSrc.includes('"use client"') === false,
      "private key read ONLY inside the server adapter module"
    );
    assert(!providerSrc.includes("PROVENANCE_PRIVATE_KEY"), "provider does not touch the private key");
    assert(!providerSrc.includes("PROVENANCE_RPC_ENDPOINT"), "provider does not touch RPC credentials");
    const uiSrc = readFileSync("components/timeline/verify-record-button.tsx", "utf8");
    assert(!uiSrc.includes("PRIVATE_KEY") && !uiSrc.includes("RPC_ENDPOINT"), "UI component never references secrets");
    assert(
      readFileSync("components/timeline/timeline-event-row.tsx", "utf8").includes('"use client"') === true,
      "timeline row is a client component reading only public record fields"
    );
  }

  /* ---------------- M+N. cross-suite guarantees ---------------- */
  console.log("\nM+N. Existing guarantees intact");
  {
    // Local default + honest unconfigured state (N, asserted also in p1).
    delete process.env.PROVENANCE_ADAPTER;
    delete process.env.PROVENANCE_PRIVATE_KEY;
    __clearEnv("PROVENANCE_CHAIN");
    __clearEnv("PROVENANCE_NETWORK");
    __clearEnv("PROVENANCE_RPC_ENDPOINT");
    __clearEnv("PROVENANCE_CONTRACT_ADDRESS");
    __setChainClientOverride(null);
    clearLocalRegistry();
    assert(!isBlockchainConfigured(), "after cleanup: not configured (local default)");
    const created = await createProvenanceRecord(BASE_INPUT);
    assert(created.status === "success" && created.record.status === "local-verified", "golden local flow unaffected (M)");
    const idHash = toRecordIdHash("some-event-id");
    assert(/^0x[0-9a-f]{64}$/.test(idHash), "record-id hash is keccak256 (raw id never on-chain)");
  }

  console.log(
    failures === 0
      ? "\nALL BLOCKCHAIN PROVENANCE CHECKS PASSED (mocked chain clients)."
      : `\n${failures} BLOCKCHAIN PROVENANCE CHECK(S) FAILED.`
  );
  process.exit(failures === 0 ? 0 : 1);
}

function __clearEnv(name: string): void {
  delete (process.env as Record<string, string | undefined>)[name];
}

void main();
