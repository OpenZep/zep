// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ICompTimelock.sol";
import "../Governor.sol";
import "../TimelockController.sol";

// cannot inherit `IGovernorWithTimelock` since we are not implementing the same interface.
abstract contract GovernorWithTimelockCompound is Governor {
    ICompTimelock private _timelock;
    mapping(uint256 => uint256) _proposalETA;

    event ProposalQueued(uint256 indexed proposalId, uint256 eta);
    /**
     * @dev Emitted when the minimum delay for future operations is modified.
     */
    event TimelockChange(address oldTimelock, address newTimelock);

    constructor(address timelock_)
    {
        _updateTimelock(timelock_);
    }

    function updateTimelock(address newTimelock) external virtual {
        require(msg.sender == address(this), "GovernorIntegratedTimelock: caller must be governor");
        _updateTimelock(newTimelock);
    }

    function _updateTimelock(address newTimelock) internal virtual {
        emit TimelockChange(address(_timelock), newTimelock);
        _timelock = ICompTimelock(payable(newTimelock));
    }

    function timelock() public virtual returns (address) {
        return address(_timelock);
    }

    function queue(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signature,
        bytes[] memory calldatas,
        bytes32 salt
    )
    public virtual returns (uint256 proposalId)
    {
        // _call is overriden have no action (while keeping the checks)
        proposalId = _execute(targets, values, calldatas, salt);

        uint256 eta = block.timestamp + _timelock.delay();
        _proposalETA[proposalId] = eta;

        for (uint256 i = 0; i < targets.length; ++i) {
            //TODO verify that bytes4(keccak256(bytes(signature))) matches the first 4 bytes of calldatas[i]
            //TODO don't pass the first 4 bytes of calldatas[i]
            _timelock.queueTransaction(
                targets[i],
                values[i],
                signature[i],
                calldatas[i],
                eta
            );
        }

        emit ProposalQueued(proposalId, eta);
    }

    function execute(
        address[] memory /*targets*/,
        uint256[] memory /*values*/,
        bytes[] memory /*calldatas*/,
        bytes32 /*salt*/
    )
    public payable virtual override returns (uint256)
    {
        revert("function-is-disabled");
    }

    function execute(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signature,
        bytes[] memory calldatas,
        bytes32 salt
    )
    public payable virtual returns (uint256 proposalId)
    {
        proposalId = hashProposal(targets, values, calldatas, salt);
        Address.sendValue(payable(_timelock), msg.value);

        uint256 eta = _proposalETA[proposalId];
        if (eta > 0) {
            for (uint256 i = 0; i < targets.length; ++i) {
                //TODO verify that bytes4(keccak256(bytes(signature))) matches the first 4 bytes of calldatas[i]
                //TODO don't pass the first 4 bytes of calldatas[i]
                _timelock.executeTransaction(
                    targets[i],
                    values[i],
                    signature[i],
                    calldatas[i],
                    eta
                );
            }
        }

        emit ProposalExecuted(proposalId);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signature,
        bytes[] memory calldatas,
        bytes32 salt
    )
    internal virtual returns (uint256 proposalId)
    {
        proposalId = super._cancel(targets, values, calldatas, salt);

        uint256 eta = _proposalETA[proposalId];
        if (eta > 0) {
            for (uint256 i = 0; i < targets.length; ++i) {
                //TODO verify that bytes4(keccak256(bytes(signature))) matches the first 4 bytes of calldatas[i]
                //TODO don't pass the first 4 bytes of calldatas[i]
                _timelock.cancelTransaction(
                    targets[i],
                    values[i],
                    signature[i],
                    calldatas[i],
                    eta
                );
            }
        }
    }

    function _calls(
        uint256 /*proposalId*/,
        address[] memory /*targets*/,
        uint256[] memory /*values*/,
        bytes[] memory /*calldatas*/,
        bytes32 /*salt*/
    )
    internal virtual override
    {
        // don't do anything here, we don't have the signatures :/
    }
}
