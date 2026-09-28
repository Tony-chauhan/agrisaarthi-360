/**
 * REAL TESTNET SMOKE TEST — submits an actual on-chain anchor transaction.
 * Usage: npx tsx scripts/testnet-smoke.ts
 *
 * ⚠ THIS IS NOT A MOCK. When full testnet configuration is present
 * (PROVENANCE_ADAPTER=testnet + chain/network/RPC/contract/signer), this
 * script broadcasts a REAL transaction that spends REAL testnet gas.
 *
 * Without configuration it SKIPS honestly (exit 0) — it never pretends a
 * mocked result is a chain test. Mock coverage lives in
 * scripts/verify-provenance-blockchain.ts.
 *
 * Steps (per master task §19):
 *   1. create deterministic test record
 *   2. compute SHA-256 hash
 *   3. submit anchor
 *   4. capture actual transaction hash
 *   5. wait for confirmation (receipt)
 *   6. verify the record on-chain
 *   7. report the REAL result
 */

import { buildCanonicalPayload, hashCanonicalPayload } from "../lib/provenance/canonical";
import {
  __setChainClientOverride,
  createBlockchainVerificationAdapter,
  isBlockchainConfigured,
} from "../lib/provenance/testnet-adapter";
import type { ProvenanceRecord } from "../lib/provenance/types";

async function main() {
  console.log("=== REAL TESTNET SMOKE TEST ===");

  if (!isBlockchainConfigured()) {
    console.log(
      "\nSKIP — blockchain not configured in this environment.\n" +
        "Set PROVENANCE_ADAPTER=testnet + PROVENANCE_CHAIN/NETWORK/RPC_ENDPOINT/\n" +
        "CONTRACT_ADDRESS/PRIVATE_KEY in .env.local to run the REAL test.\n" +
        "Mocked coverage: npx tsx scripts/verify-provenance-blockchain.ts"
    );
    process.exit(0);
  }

  // Ensure no mock can leak into the REAL path.
  __setChainClientOverride(null);

  const createdAt = new Date().toISOString();
  const canonical = buildCanonicalPayload(
    {
      eventType: "FARM_RECORD_CREATED",
      eventTimestamp: createdAt,
      entitySummary: { statusText: "Testnet smoke test record" },
      farmContext: { location: "Smoke Test" },
    },
    createdAt
  );
  const recordHash = hashCanonicalPayload(canonical);
  console.log(`\n1-2. Deterministic test record created. Hash: ${recordHash}`);

  const adapter = createBlockchainVerificationAdapter();
  console.log("\n3-5. Submitting REAL anchor transaction (waiting for receipt)…");

  let record: ProvenanceRecord;
  try {
    record = await adapter.submit({
      recordHash,
      eventType: "FARM_RECORD_CREATED",
      eventTimestamp: createdAt,
      metadata: { eventId: `smoke-${Date.now()}` },
    });
  } catch (err) {
    console.error("\nREAL RESULT: submission FAILED.");
    console.error(err instanceof Error ? err.message : err);
    console.error("No transaction was confirmed. Nothing is fabricated.");
    process.exit(1);
  }

  console.log("\n=== REAL RESULT ===");
  console.log(`network:         ${record.network}`);
  console.log(`contract:        ${record.contractAddress ?? "n/a"}`);
  console.log(`tx hash:         ${record.transactionHash ?? "MISSING (would be a bug)"}`);
  console.log(`block:           ${record.blockNumber ?? "n/a"}`);
  console.log(`status:          ${record.status}`);

  if (record.status !== "blockchain-verified" || !record.transactionHash) {
    console.error("\nFAILED — no confirmed transaction. Verification not claimed.");
    process.exit(1);
  }

  console.log("\n6. Verifying on-chain…");
  const verification = await adapter.verify(record);
  console.log(`verified:        ${verification.verified}`);
  console.log(`source:          ${verification.source}`);
  console.log(`reason:          ${verification.reason}`);

  const ok = verification.verified && verification.source === "BLOCKCHAIN";
  console.log(
    ok
      ? `\nREAL TESTNET SMOKE TEST PASSED — transaction ${record.transactionHash} is confirmed and the contract verifies the record hash.`
      : "\nREAL TESTNET SMOKE TEST FAILED — verification did not confirm on-chain."
  );
  process.exit(ok ? 0 : 1);
}

void main();
