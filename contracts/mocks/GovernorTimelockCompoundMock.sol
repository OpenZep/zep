// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../governance/extensions/GovernorTimelockCompound.sol";
import "../governance/extensions/GovernorCountingSimple.sol";
import "../governance/extensions/GovernorVotesQuorumFraction.sol";

contract GovernorTimelockCompoundMock is GovernorTimelockCompound, GovernorVotesQuorumFraction, GovernorCountingSimple {
    uint256 immutable _votingDelay;
    uint256 immutable _votingPeriod;

    constructor(
        string memory name_,
        ERC20Votes token_,
        uint256 votingDelay_,
        uint256 votingPeriod_,
        ICompoundTimelock timelock_,
        uint256 quorumNumerator_
    )
        Governor(name_)
        GovernorTimelockCompound(timelock_)
        GovernorVotes(token_)
        GovernorVotesQuorumFraction(quorumNumerator_)
    {
        _votingDelay = votingDelay_;
        _votingPeriod = votingPeriod_;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(Governor, GovernorTimelockCompound)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function votingDelay() public view override(IGovernor, Governor) returns (uint256) {
        return _votingDelay;
    }

    function votingPeriod() public view override(IGovernor, Governor) returns (uint256) {
        return _votingPeriod;
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 salt
    ) public returns (uint256 proposalId) {
        return _cancel(targets, values, calldatas, salt);
    }

    /**
     * Overriding nightmare
     */
    function state(uint256 proposalId)
        public
        view
        virtual
        override(Governor, GovernorTimelockCompound)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal virtual override(Governor, GovernorTimelockCompound) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 salt
    ) internal virtual override(Governor, GovernorTimelockCompound) returns (uint256 proposalId) {
        return super._cancel(targets, values, calldatas, salt);
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        virtual
        override(IGovernor, Governor, GovernorVotes)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }

    function _executor() internal view virtual override(Governor, GovernorTimelockCompound) returns (address) {
        return super._executor();
    }
}
