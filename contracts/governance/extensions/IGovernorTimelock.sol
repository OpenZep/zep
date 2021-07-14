// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../IGovernor.sol";

/**
 * @dev Extension of the {IGovernor} for timelock supporting modules.
 *
 * _Available since v4.3._
 */
interface IGovernorTimelock is IGovernor {
    event ProposalQueued(uint256 proposalId, uint256 eta);

    function timelock() external view returns (address);

    function proposalEta(uint256 proposalId) external view returns (uint256);

    function queue(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata calldatas,
        bytes32 descriptionHash
    ) external returns (uint256 proposalId);
}
