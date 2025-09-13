// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @notice Safe ERC20 ,ERC721 multi transfer library that gracefully handles missing return values.
/// @author 0XCocomastoras
/// @author Modified from Solady (https://github.com/vectorized/solady/blob/main/src/utils/SafeTransferLib.sol)
/// @author Modified from Solmate (https://github.com/transmissions11/solmate/blob/main/src/utils/SafeTransferLib.sol)
///
/// @dev Note:
/// - For ERC20s and ERC721s, this implementation won't check that a token has code,
/// responsibility is delegated to the caller.
contract TokenTransferer {
    error TransferFromFailed();
    function _cacheAndPerformMultiERC20TransferCustom(address token, address[] memory recipients, uint256[] memory winnerIds, uint256 winningAmount, bytes32 drawId_) internal {
        bytes32 cache;
        assembly {
            cache := mload(0x40)
        }
        _performMultiERC20TransferCustom(token, recipients, winnerIds, winningAmount, drawId_);
        assembly {
            mstore(0x40, cache)
        }
    }
    function _performMultiERC20TransferCustom(address token, address[] memory recipients, uint256[] memory winnerIds, uint256 winningAmount, bytes32 drawId_) internal {
        /// @solidity memory-safe-assembly
         assembly {
            let recipientsLength := mload(recipients)
            let totalAmount := mul(winningAmount, recipientsLength)
            mstore(0x60, totalAmount) // Store the `amount` argument.
            mstore(0x40, address()) // Store the `to` argument.
            mstore(0x2c, shl(96, caller())) // Store the `from` argument.
            mstore(0x0c, 0x23b872dd000000000000000000000000)
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    or(
                        eq(mload(0x00), 1), iszero(returndatasize())), // Returned 1 or nothing.
                        call(gas(), token, 0, 0x1c, 0x64, 0x00, 0x20)
                    )
                )
            {
                mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                revert(0x1c, 0x04)
            }
             let sumAmount := 0
             //save drawId_ to 0x00
             mstore(0x00, drawId_)
             //save slot to 0x20
             mstore(0x20, 1)
             // compute mapping hash key
             let hash := keccak256(0, 0x40)
             mstore(0x40, winningAmount) // Store the `amount` argument.
             for { let i := 0 } lt(i, recipientsLength) { i := add(i, 1) } {
                let to := mload(add(recipients, add(mul(i, 0x20), 0x20)))
                mstore(0x00, mload(add(winnerIds, add(0x20, mul(i, 0x20)))))
                mstore(0x20, hash)
                let finalKey := keccak256(0x00, 0x40)
                let winnerPosition := tload(finalKey)
                if iszero(winnerPosition){
                    mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                    revert(0x1c, 0x04)
                }
                tstore(finalKey, 0)
                sumAmount := add(sumAmount, winningAmount)
                mstore(0x2c, shl(96, to)) // Store the `to` argument.
                mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
//                 Perform the transfer, reverting upon failure.
                if iszero(
                    and( // The arguments of `and` are evaluated from right to left.
                        or(eq(mload(0x00), 1), iszero(returndatasize())), // Returned 1 or nothing.
                        call(gas(), token, 0, 0x1c, 0x44, 0x00, 0x20)
                    )
                ) {
                    mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                    revert(0x1c, 0x04)
                }
            }
            if iszero(eq(totalAmount, sumAmount)) {
                revert(0,0)
            }
            mstore(0x60, 0) // Restore the zero slot to zero.
         }
    }
    function _performNativeCustom(address[] memory recipients, uint256[] memory winnerIds, uint256 winningAmount, bytes32 drawId_) internal {
        /// @solidity memory-safe-assembly
         assembly {
            let recipientsLength := mload(recipients)
            let m := mload(0x40) // Cache the free memory pointer.
            //save drawId_ to 0x00
            mstore(0x00, drawId_)
            //save slot to 0x20
            mstore(0x20, 1)
            // compute mapping hash key
            let hash := keccak256(0, 0x40)
            for { let i := 0 } lt(i, recipientsLength) { i := add(i, 1) } {
                let to := mload(add(recipients, add(mul(i, 0x20), 0x20)))
                mstore(0x00, mload(add(winnerIds, add(0x20, mul(i, 0x20)))))
                mstore(0x20, hash)
                let finalKey := keccak256(0x00, 0x40)
                let winnerPosition := tload(finalKey)
                if iszero(winnerPosition){
                    mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                    revert(0x1c, 0x04)
                }
                tstore(finalKey, 0)
                if iszero( call(
                    gas(),
                    to,
                    winningAmount,
                    0,
                    0,
                    0,
                    0
                 )) {
                     revert(0,0)
                 }
            }
            mstore(0x60, 0) // Restore the zero slot to zero.
            mstore(0x40, m) // Restore the free memory pointer.
         }
    }
    function _performMultiERC721Transfer(address token, address[] memory recipients, uint256[] memory winnerIds, uint256[] memory erc721Ids, bytes32 drawId_) internal {
        /// @solidity memory-safe-assembly
         assembly {
             let recipientsLength := mload(recipients)
             let from := caller()
             let m := mload(0x40) // Cache the free memory pointer.
             //save drawId_ to 0x00
             mstore(0x00, drawId_)
             //save slot to 0x20
             mstore(0x20, 1)
             // compute mapping hash key
             let hash := keccak256(0, 0x40)
             for { let i := 0 } lt(i, recipientsLength) { i := add(i, 1) } {
                let to := mload(add(recipients, add(mul(i, 0x20), 0x20)))
                mstore(0x00, mload(add(winnerIds, add(0x20, mul(i, 0x20)))))
                mstore(0x20, hash)
                let finalKey := keccak256(0x00, 0x40)
                let winnerPosition := tload(finalKey)
                if iszero(winnerPosition){
                    mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                    revert(0x1c, 0x04)
                }
                let erc721Id := mload(add(erc721Ids, mul(0x20, winnerPosition)))
                tstore(finalKey, 0)
                mstore(0x60, erc721Id) // Store the `identifier` argument.
                mstore(0x40, to) // Store the `to` argument.
                mstore(0x2c, shl(96, from)) // Store the `from` argument.
                mstore(0x0c, 0x23b872dd000000000000000000000000) // `transferFrom(address,address,uint256)`.
                // Perform the transfer, reverting upon failure.
                if iszero(
                    and( // The arguments of `and` are evaluated from right to left.
                        iszero(returndatasize()), // Returned error.
                        call(gas(), token, 0, 0x1c, 0x64, 0x00, 0x00)
                    )
                ) {
                    mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                    revert(0x1c, 0x04)
                }
            }
            mstore(0x60, 0) // Restore the zero slot to zero.
            mstore(0x40, m) // Restore the free memory pointer.
         }
    }
}


