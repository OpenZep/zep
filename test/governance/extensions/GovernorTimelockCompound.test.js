const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Enums = require('../../helpers/enums');
const RLP = require('rlp');

const {
  runGovernorWorkflow,
} = require('../GovernorWorkflow.behavior');

const {
  shouldSupportInterfaces,
} = require('../../utils/introspection/SupportsInterface.behavior');

const Token = artifacts.require('ERC20VotesMock');
const Timelock = artifacts.require('CompTimelock');
const Governor = artifacts.require('GovernorTimelockCompoundMock');
const CallReceiver = artifacts.require('CallReceiverMock');

function makeContractAddress (creator, nonce) {
  return web3.utils.toChecksumAddress(web3.utils.sha3(RLP.encode([creator, nonce])).slice(12).substring(14));
}

contract('GovernorTimelockCompound', function (accounts) {
  const [ admin, voter ] = accounts;

  const name = 'OZ-Governor';
  // const version = '1';
  const tokenName = 'MockToken';
  const tokenSymbol = 'MTKN';
  const tokenSupply = web3.utils.toWei('100');

  beforeEach(async function () {
    const [ deployer ] = await web3.eth.getAccounts();

    this.token = await Token.new(tokenName, tokenSymbol);

    // Need to predict governance address to set it as timelock admin with a delayed transfer
    const nonce = await web3.eth.getTransactionCount(deployer);
    const predictGovernor = makeContractAddress(deployer, nonce + 1);

    this.timelock = await Timelock.new(predictGovernor, 2 * 86400);
    this.mock = await Governor.new(name, this.token.address, 4, 16, this.timelock.address, 0);
    this.receiver = await CallReceiver.new();
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
    expect(await this.timelock.admin()).to.be.equal(this.mock.address);
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
          queue: { delay: 7 * 86400 },
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
        this.receipts.queue,
        'ProposalQueued',
        { proposalId: this.id },
      );
      await expectEvent.inTransaction(
        this.receipts.queue.transactionHash,
        this.timelock,
        'QueueTransaction',
        { eta: this.eta },
      );
      expectEvent(
        this.receipts.execute,
        'ProposalExecuted',
        { proposalId: this.id },
      );
      await expectEvent.inTransaction(
        this.receipts.execute.transactionHash,
        this.timelock,
        'ExecuteTransaction',
        { eta: this.eta },
      );
      await expectEvent.inTransaction(
        this.receipts.execute.transactionHash,
        this.receiver,
        'MockFunctionCalled',
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
          execute: { error: 'GovernorTimelockCompound: proposal not yet queued' },
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
          execute: { error: 'Timelock::executeTransaction: Transaction hasn\'t surpassed time lock' },
        },
      };
    });
    afterEach(async function () {
      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Queued);
    });
    runGovernorWorkflow();
  });

  describe('to late', function () {
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
          queue: { delay: 30 * 86400 },
          execute: { error: 'Governor: proposal not successful' },
        },
      };
    });
    afterEach(async function () {
      expect(await this.mock.state(this.id)).to.be.bignumber.equal(Enums.ProposalState.Expired);
    });
    runGovernorWorkflow();
  });

  describe('deplicated underlying call', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          Array(2).fill(this.token.address),
          Array(2).fill(web3.utils.toWei('0')),
          Array(2).fill(this.token.contract.methods.approve(this.receiver.address, constants.MAX_UINT256).encodeABI()),
          '<proposal description>',
        ],
        voters: [
          { voter: voter, support: Enums.VoteType.For },
        ],
        steps: {
          queue: {
            error: 'GovernorTimelockCompound: identical proposal action already queued',
          },
          execute: {
            error: 'GovernorTimelockCompound: proposal not yet queued',
          },
        },
      };
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
          queue: { delay: 7 * 86400 },
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

  describe('cancel after queue prevents executing', function () {
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
          queue: { delay: 7 * 86400 },
          execute: { enable: false },
        },
      };
    });
    afterEach(async function () {
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
        'CancelTransaction',
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
      this.newTimelock = await Timelock.new(this.mock.address, 7 * 86400);
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
            [
              this.timelock.address,
              this.mock.address,
            ],
            [
              web3.utils.toWei('0'),
              web3.utils.toWei('0'),
            ],
            [
              this.timelock.contract.methods.setPendingAdmin(admin).encodeABI(),
              this.mock.contract.methods.updateTimelock(this.newTimelock.address).encodeABI(),
            ],
            '<proposal description>',
          ],
          voters: [
            { voter: voter, support: Enums.VoteType.For },
          ],
          steps: {
            queue: { delay: 7 * 86400 },
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

    describe('prevent losing control over old timelock ', function () {
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
            queue: { delay: 7 * 86400 },
            execute: { error: 'Timelock::executeTransaction: Transaction execution reverted.' },
          },
        };
      });
      afterEach(async function () {
        expect(await this.mock.timelock()).to.be.bignumber.equal(this.timelock.address);
      });
      runGovernorWorkflow();
    });
  });

  describe('transfer timelock to new governor', function () {
    beforeEach(async function () {
      this.newGovernor = await Governor.new(name, this.token.address, 8, 32, this.timelock.address, 0);
    });

    describe('using workflow', function () {
      beforeEach(async function () {
        this.settings = {
          proposal: [
            [ this.timelock.address ],
            [ web3.utils.toWei('0') ],
            [ this.timelock.contract.methods.setPendingAdmin(this.newGovernor.address).encodeABI() ],
            '<proposal description>',
          ],
          voters: [
            { voter: voter, support: Enums.VoteType.For },
          ],
          steps: {
            queue: { delay: 7 * 86400 },
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
        await expectEvent.inTransaction(
          this.receipts.execute.transactionHash,
          this.timelock,
          'NewPendingAdmin',
          { newPendingAdmin: this.newGovernor.address },
        );
        await this.newGovernor.__acceptAdmin();
        expect(await this.timelock.admin()).to.be.bignumber.equal(this.newGovernor.address);
      });
      runGovernorWorkflow();
    });
  });
});
