// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "solady/src/utils/MerkleProofLib.sol";

contract MerkleProofVerifier {
    /// @dev mapping from draw id to merkle tree root hash
    mapping(bytes32 => bytes32) public drawIdToRootHash;

    function _verify(bytes32 drawId_, bytes32[] memory proof, address[] memory winners, uint256[] memory uids, bool[] memory flags) internal view returns (bool) {
        bytes32[] memory leaves = new bytes32[](winners.length);
        for (uint i = 0; i< winners.length;) {
            leaves[i] = keccak256(bytes.concat(keccak256(abi.encode(uids[i], winners[i]))));
            unchecked {
                ++i;
            }
        }
        require(MerkleProofLib.verifyMultiProof(proof, drawIdToRootHash[drawId_], leaves, flags), 'NVPRO');
        return true;
    }
}
