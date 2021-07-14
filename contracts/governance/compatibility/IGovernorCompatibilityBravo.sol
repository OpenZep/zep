// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../IGovernor.sol";

/**
 * @dev Interface extension that adds missing functions to the {Governor} core to provide `GovernorBravo` compatibility.
 *
 * _Available since v4.3._
 */
interface IGovernorCompatibilityBravo is IGovernor {
    /**
     * @dev Proposal structure from Compound Governor Bravo. Not actually used by the compatibility layer, as
     * {{proposal}} returns a very different structure.
     */
    struct Proposal {
        uint256 id;
        address proposer;
        uint256 eta;
        address[] targets;
        uint256[] values;
        string[] signatures;
        bytes[] calldatas;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool canceled;
        bool executed;
        mapping(address => Receipt) receipts;
    }

    /**
     * @dev Receipt structure from Compound Governor Bravo
     */
    struct Receipt {
        bool hasVoted;
        uint8 support;
        uint96 votes;
    }

    /**
     * @dev Part of the Governor Bravo's interface: _"The delay before voting on a proposal may take place, once*
     * proposed, in blocks"_.
     *
     * Note: already defined in {IGovernor}
     */
    // function votingDelay() external view returns (uint256);

    /**
     * @dev Part of the Governor Bravo's interface: _"The duration of voting on a proposal, in blocks"_.
     *
     * Note: already defined in {IGovernor}
     */
    // function votingPeriod() external view returns (uint256);

    /**
     * @dev Part of the Governor Bravo's interface.
     */
    function quorumVotes() external view returns (uint256);

    /**
     * @dev Part of the Governor Bravo's interface: _"The official record of all proposals ever proposed"_.
     */
    function proposals(uint256)
        external
        view
        returns (
            uint256 id,
            address proposer,
            uint256 eta,
            uint256 startBlock,
            uint256 endBlock,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            bool canceled,
            bool executed
        );

    /**
     * @dev Part of the Governor Bravo's interface: _"Function used to propose a new proposal"_.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256);

    /**
     * @dev Part of the Governor Bravo's interface: _"Queues a proposal of state succeeded"_.
     */
    function queue(uint256 proposalId) external;

    /**
     * @dev Part of the Governor Bravo's interface: _"Executes a queued proposal if eta has passed"_.
     */
    function execute(uint256 proposalId) external payable;

    /**
     * @dev Part of the Governor Bravo's interface: _"Gets actions of a proposal"_.
     */
    function getActions(uint256 proposalId)
        external
        view
        returns (
            address[] memory targets,
            uint256[] memory values,
            string[] memory signatures,
            bytes[] memory calldatas
        );

    /**
     * @dev Part of the Governor Bravo's interface: _"Gets the receipt for a voter on a given proposal"_.
     */
    function getReceipt(uint256 proposalId, address voter) external view returns (Receipt memory);

    /**
     * @dev Part of the Governor Bravo's interface: _"The number of votes required in order for a voter to become a proposer"_.
     */
    function proposalThreshold() external view returns (uint256);
}
