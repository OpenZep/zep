const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Enums = require('../../helpers/enums');

const {
  runGovernorWorkflow,
} = require('../GovernorWorkflow.behavior');

const {
  shouldSupportInterfaces,
} = require('../../utils/introspection/SupportsInterface.behavior');

const Token = artifacts.require('ERC20VotesMock');
const Timelock = artifacts.require('TimelockController');
const Governor = artifacts.require('GovernorTimelockControlMock');
const CallReceiver = artifacts.require('CallReceiverMock');

contract('GovernorTimelockControl', function (accounts) {
  const [ voter ] = accounts;

  const name = 'OZ-Governor';
  // const version = '1';
  const tokenName = 'MockToken';
  const tokenSymbol = 'MTKN';
  const tokenSupply = web3.utils.toWei('100');

  beforeEach(async function () {
    const [ deployer ] = await web3.eth.getAccounts();

    this.token = await Token.new(tokenName, tokenSymbol);
    this.timelock = await Timelock.new(3600, [], []);
    this.mock = await Governor.new(name, this.token.address, 4, 16, this.timelock.address, 0);
    this.receiver = await CallReceiver.new();
    // normal setup: governor is proposer, everyone is executor, timelock is its own admin
    await this.timelock.grantRole(await this.timelock.PROPOSER_ROLE(), this.mock.address);
    await this.timelock.grantRole(await this.timelock.EXECUTOR_ROLE(), constants.ZERO_ADDRESS);
    await this.timelock.revokeRole(await this.timelock.TIMELOCK_ADMIN_ROLE(), deployer);
    await this.token.mint(voter, tokenSupply);
    await this.token.delegate(voter, { from: voter });
  });

  shouldSupportInterfaces([
    'ERC165',
    'Governor',
    'GovernorTimelock',
  ]);

  it('post deployment check', async function () {
    expect(await this.mock.name()).to.be.equal(name);
    expect(await this.mock.token()).to.be.equal(this.token.address);
    expect(await this.mock.votingDelay()).to.be.bignumber.equal('4');
    expect(await this.mock.votingPeriod()).to.be.bignumber.equal('16');
    expect(await this.mock.quorum(0)).to.be.bignumber.equal('0');

    expect(await this.mock.timelock()).to.be.equal(this.timelock.address);
  });

  describe('nominal', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ],
          [ web3.utils.toWei('0') ],
          [ this.receiver.contract.methods.mockFunction().encodeABI() ],
          '<proposal description>',
        ],
        voters: [
          { voter: voter, support: Enums.VoteType.For },
        ],
        steps: {
          queue: { delay: 3600 },
        },
      };
    });
    afterEach(async function () {
      const timelockid = await this.timelock.hashOperationBatch(
        ...this.settings.proposal.slice(0, 3),
        '0x0',
        this.descriptionHash,
      );

      expectEvent(
        this.receipts.propose,
        'ProposalCreated',
        { proposalId: this.id },
      );
      expectEvent(
        this.receipts.queue,
        'ProposalQueued',
        { proposalId: this.id },
      );
      await expectEvent.inTransaction(
        this.receipts.queue.transactionHash,
        this.timelock,
        'CallScheduled',
        { id: timelockid },
      );
      expectEvent(
        this.receipts.execute,
        'ProposalExecuted',
        { proposalId: this.id },
      );
      await expectEvent.inTransaction(
        this.receipts.execute.transactionHash,
        this.timelock,
        'CallExecuted',
        { id: timelockid },
      );
      await expectEvent.inTransaction(
        this.receipts.execute.transactionHash,
        this.receiver,
        'MockFunctionCalled',
      );
    });
    runGovernorWorkflow();
  });

  describe('executed by other proposer', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ],
          [ web3.utils.toWei('0') ],
          [ this.receiver.contract.methods.mockFunction().encodeABI() ],
          '<proposal description>',
        ],
        voters: [
          { voter: voter, support: Enums.VoteType.For },
        ],
        steps: {
          queue: { delay: 3600 },
          execute: { enable: false },
        },
      };
    });
    afterEach(async function () {
      await this.timelock.executeBatch(
        ...this.settings.proposal.slice(0, 3),
        '0x0',
        this.descriptionHash,
      );

      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Executed);

      await expectRevert(
        this.mock.execute(...this.settings.proposal.slice(0, -1), this.descriptionHash),
        'Governor: proposal not successful',
      );
    });
    runGovernorWorkflow();
  });

  describe('not queued', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ],
          [ web3.utils.toWei('0') ],
          [ this.receiver.contract.methods.mockFunction().encodeABI() ],
          '<proposal description>',
        ],
        voters: [
          { voter: voter, support: Enums.VoteType.For },
        ],
        steps: {
          queue: { enable: false },
          execute: { error: 'TimelockController: operation is not ready' },
        },
      };
    });
    afterEach(async function () {
      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Succeeded);
    });
    runGovernorWorkflow();
  });

  describe('to early', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ],
          [ web3.utils.toWei('0') ],
          [ this.receiver.contract.methods.mockFunction().encodeABI() ],
          '<proposal description>',
        ],
        voters: [
          { voter: voter, support: Enums.VoteType.For },
        ],
        steps: {
          execute: { error: 'TimelockController: operation is not ready' },
        },
      };
    });
    afterEach(async function () {
      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Queued);
    });
    runGovernorWorkflow();
  });

  describe('re-queue / re-execute', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ],
          [ web3.utils.toWei('0') ],
          [ this.receiver.contract.methods.mockFunction().encodeABI() ],
          '<proposal description>',
        ],
        voters: [
          { voter: voter, support: Enums.VoteType.For },
        ],
        steps: {
          queue: { delay: 3600 },
        },
      };
    });
    afterEach(async function () {
      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Executed);

      await expectRevert(
        this.mock.queue(...this.settings.proposal.slice(0, -1), this.descriptionHash),
        'Governor: proposal not successful',
      );
      await expectRevert(
        this.mock.execute(...this.settings.proposal.slice(0, -1), this.descriptionHash),
        'Governor: proposal not successful',
      );
    });
    runGovernorWorkflow();
  });

  describe('cancel before queue prevents scheduling', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ],
          [ web3.utils.toWei('0') ],
          [ this.receiver.contract.methods.mockFunction().encodeABI() ],
          '<proposal description>',
        ],
        voters: [
          { voter: voter, support: Enums.VoteType.For },
        ],
        steps: {
          queue: { enable: false },
          execute: { enable: false },
        },
      };
    });
    afterEach(async function () {
      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Succeeded);

      expectEvent(
        await this.mock.cancel(...this.settings.proposal.slice(0, -1), this.descriptionHash),
        'ProposalCanceled',
        { proposalId: this.id },
      );

      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Canceled);

      await expectRevert(
        this.mock.queue(...this.settings.proposal.slice(0, -1), this.descriptionHash),
        'Governor: proposal not successful',
      );
    });
    runGovernorWorkflow();
  });

  describe('cancel after queue prevents execution', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ],
          [ web3.utils.toWei('0') ],
          [ this.receiver.contract.methods.mockFunction().encodeABI() ],
          '<proposal description>',
        ],
        voters: [
          { voter: voter, support: Enums.VoteType.For },
        ],
        steps: {
          queue: { delay: 3600 },
          execute: { enable: false },
        },
      };
    });
    afterEach(async function () {
      const timelockid = await this.timelock.hashOperationBatch(
        ...this.settings.proposal.slice(0, 3),
        '0x0',
        this.descriptionHash,
      );

      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Queued);

      const receipt = await this.mock.cancel(...this.settings.proposal.slice(0, -1), this.descriptionHash);
      expectEvent(
        receipt,
        'ProposalCanceled',
        { proposalId: this.id },
      );
      await expectEvent.inTransaction(
        receipt.receipt.transactionHash,
        this.timelock,
        'Cancelled',
        { id: timelockid },
      );

      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Canceled);

      await expectRevert(
        this.mock.execute(...this.settings.proposal.slice(0, -1), this.descriptionHash),
        'Governor: proposal not successful',
      );
    });
    runGovernorWorkflow();
  });

  describe('updateTimelock', function () {
    beforeEach(async function () {
      this.newTimelock = await Timelock.new(3600, [], []);
    });

    it('protected', async function () {
      await expectRevert(
        this.mock.updateTimelock(this.newTimelock.address),
        'Governor: onlyGovernance',
      );
    });

    describe('using workflow', function () {
      beforeEach(async function () {
        this.settings = {
          proposal: [
            [ this.mock.address ],
            [ web3.utils.toWei('0') ],
            [ this.mock.contract.methods.updateTimelock(this.newTimelock.address).encodeABI() ],
            '<proposal description>',
          ],
          voters: [
            { voter: voter, support: Enums.VoteType.For },
          ],
          steps: {
            queue: { delay: 3600 },
          },
        };
      });
      afterEach(async function () {
        expectEvent(
          this.receipts.propose,
          'ProposalCreated',
          { proposalId: this.id },
        );
        expectEvent(
          this.receipts.execute,
          'ProposalExecuted',
          { proposalId: this.id },
        );
        expectEvent(
          this.receipts.execute,
          'TimelockChange',
          { oldTimelock: this.timelock.address, newTimelock: this.newTimelock.address },
        );
        expect(await this.mock.timelock()).to.be.bignumber.equal(this.newTimelock.address);
      });
      runGovernorWorkflow();
    });
  });
});
