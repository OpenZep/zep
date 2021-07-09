// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../governance/Governor.sol";
import "../governance/extensions/GovernorCountingSimple.sol";
import "../governance/extensions/GovernorVotesQuorumFraction.sol";

contract GovernorMock is Governor, GovernorVotesQuorumFraction, GovernorCountingSimple {
    constructor(
        string memory name_,
        ERC20Votes token_,
        uint256 quorumNumerator_
    ) Governor(name_) GovernorVotes(token_) GovernorVotesQuorumFraction(quorumNumerator_) {}

    receive() external payable {}

    function votingDelay() public pure override returns (uint256) {
        return 4; // blocks
    }

    function votingPeriod() public pure override returns (uint256) {
        return 16; // blocks
    }

    function cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 salt
    ) public returns (uint256 proposalId) {
        return _cancel(targets, values, calldatas, salt);
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        virtual
        override(Governor, GovernorVotes)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }
}
