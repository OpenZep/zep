const { BN, expectEvent, time } = require('@openzeppelin/test-helpers');
const Enums = require('../../helpers/enums');

const {
  runGovernorWorkflow,
} = require('./../GovernorWorkflow.behavior');

const Token = artifacts.require('ERC20VotesMock');
const Governor = artifacts.require('GovernorMock');
const CallReceiver = artifacts.require('CallReceiverMock');

contract('GovernorVotesQuorumFraction', function (accounts) {
  const [ owner, voter1, voter2, voter3, voter4 ] = accounts;

  const name = 'OZ-Governor';
  // const version = '1';
  const tokenName = 'MockToken';
  const tokenSymbol = 'MTKN';
  const tokenSupply = new BN(web3.utils.toWei('100'));
  const ratio = new BN(8); // percents
  const newRatio = new BN(6); // percents

  beforeEach(async function () {
    this.owner = owner;
    this.token = await Token.new(tokenName, tokenSymbol);
    this.mock = await Governor.new(name, this.token.address, 4, 16, ratio);
    this.receiver = await CallReceiver.new();
    await this.token.mint(owner, tokenSupply);
    await this.token.delegate(voter1, { from: voter1 });
    await this.token.delegate(voter2, { from: voter2 });
    await this.token.delegate(voter3, { from: voter3 });
    await this.token.delegate(voter4, { from: voter4 });
  });

  it('deployment check', async function () {
    expect(await this.mock.name()).to.be.equal(name);
    expect(await this.mock.token()).to.be.equal(this.token.address);
    expect(await this.mock.votingDelay()).to.be.bignumber.equal('4');
    expect(await this.mock.votingPeriod()).to.be.bignumber.equal('16');
    expect(await this.mock.quorum(0)).to.be.bignumber.equal('0');
    expect(await this.mock.quorumNumerator()).to.be.bignumber.equal(ratio);
    expect(await this.mock.quorumDenominator()).to.be.bignumber.equal('100');
    expect(await time.latestBlock().then(blockNumber => this.mock.quorum(blockNumber.subn(1))))
      .to.be.bignumber.equal(tokenSupply.mul(ratio).divn(100));
  });

  describe('quroum not reached', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ],
          [ web3.utils.toWei('0') ],
          [ this.receiver.contract.methods.mockFunction().encodeABI() ],
          '<proposal description>',
        ],
        tokenHolder: owner,
        voters: [
          { voter: voter1, weight: web3.utils.toWei('1'), support: Enums.VoteType.For },
        ],
        steps: {
          execute: { error: 'Governor: proposal not successful' },
        },
      };
    });
    runGovernorWorkflow();
  });

  describe('update quorum ratio through proposal', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.mock.address ],
          [ web3.utils.toWei('0') ],
          [ this.mock.contract.methods.updateQuorumNumerator(newRatio).encodeABI() ],
          '<proposal description>',
        ],
        tokenHolder: owner,
        voters: [
          { voter: voter1, weight: tokenSupply, support: Enums.VoteType.For },
        ],
      };
    });
    afterEach(async function () {
      await expectEvent.inTransaction(
        this.receipts.execute.transactionHash,
        this.mock,
        'QuorumNumeratorUpdated',
        {
          oldQuorumNumerator: ratio,
          newQuorumNumerator: newRatio,
        },
      );

      expect(await this.mock.quorumNumerator()).to.be.bignumber.equal(newRatio);
      expect(await this.mock.quorumDenominator()).to.be.bignumber.equal('100');
      expect(await time.latestBlock().then(blockNumber => this.mock.quorum(blockNumber.subn(1))))
        .to.be.bignumber.equal(tokenSupply.mul(newRatio).divn(100));
    });
    runGovernorWorkflow();
  });

  describe('update quorum over the maximum', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.mock.address ],
          [ web3.utils.toWei('0') ],
          [ this.mock.contract.methods.updateQuorumNumerator(new BN(101)).encodeABI() ],
          '<proposal description>',
        ],
        tokenHolder: owner,
        voters: [
          { voter: voter1, weight: tokenSupply, support: Enums.VoteType.For },
        ],
        steps: {
          execute: { error: 'GovernorVotesQuorumFraction: quorumNumerator over quorumDenominator' },
        },
      };
    });
    runGovernorWorkflow();
  });
});
