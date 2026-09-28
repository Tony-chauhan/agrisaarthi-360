// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProvenanceAnchor
 * @notice Minimal provenance anchoring for AgriSaarthi 360.
 *
 * Stores NOTHING except a commit timestamp per record hash. The full
 * canonical record stays OFF-CHAIN (in the application); only the
 * SHA-256 hash of that record and a salted hash of the record id are
 * committed on-chain. This proves *that* a record existed in exactly
 * that form at a point in time — no farmer data, no crop images, no AI
 * output, no application payloads ever touch the chain.
 *
 * Surface area: one write function, one event, three read functions.
 * No payment logic, no token logic, no admin keys, no upgrades.
 */
contract ProvenanceAnchor {
    // recordHash => commit timestamp (0 = never anchored)
    mapping(bytes32 => uint256) public committedAt;

    uint256 public totalAnchored;

    event RecordAnchored(
        bytes32 indexed recordHash,
        bytes32 indexed recordId,
        uint256 timestamp,
        address indexed submitter
    );

    error AlreadyAnchored(bytes32 recordHash, uint256 existingTimestamp);

    /**
     * @notice Anchor a canonical record hash on-chain.
     * @param recordHash SHA-256 of the canonical provenance payload (32 bytes).
     * @param recordId   keccak256 of the record/event id (32 bytes — raw ids never go on-chain).
     */
    function anchor(bytes32 recordHash, bytes32 recordId) external {
        if (committedAt[recordHash] != 0) {
            revert AlreadyAnchored(recordHash, committedAt[recordHash]);
        }
        committedAt[recordHash] = block.timestamp;
        totalAnchored += 1;
        emit RecordAnchored(recordHash, recordId, block.timestamp, msg.sender);
    }

    /** @notice True when this exact record hash was already anchored. */
    function isAnchored(bytes32 recordHash) external view returns (bool) {
        return committedAt[recordHash] != 0;
    }

    /** @notice Block-timestamp commit time for a record hash (0 if none). */
    function commitTimestamp(bytes32 recordHash) external view returns (uint256) {
        return committedAt[recordHash];
    }

    /** @notice How many distinct record hashes this contract has anchored. */
    function anchoredCount() external view returns (uint256) {
        return totalAnchored;
    }
}
