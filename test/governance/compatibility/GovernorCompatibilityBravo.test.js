const { BN, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const Enums = require('../../helpers/enums');
const RLP = require('rlp');

const {
  runGovernorWorkflow,
} = require('../GovernorWorkflow.behavior');

const Token = artifacts.require('ERC20VotesCompMock');
const Timelock = artifacts.require('CompTimelock');
const Governor = artifacts.require('GovernorCompatibilityBravoMock');
const CallReceiver = artifacts.require('CallReceiverMock');

async function getReceiptOrRevert (promise, error = undefined) {
  if (error) {
    await expectRevert(promise, error);
    return undefined;
  } else {
    const { receipt } = await promise;
    return receipt;
  }
}

function tryGet (obj, path = '') {
  try {
    return path.split('.').reduce((o, k) => o[k], obj);
  } catch (_) {
    return undefined;
  }
}

function makeContractAddress (creator, nonce) {
  return web3.utils.toChecksumAddress(web3.utils.sha3(RLP.encode([creator, nonce])).slice(12).substring(14));
}

contract('GovernorCompatibilityBravo', function (accounts) {
  const [ owner, proposer, voter1, voter2, voter3, voter4, other ] = accounts;

  const name = 'OZ-Governor';
  // const version = '1';
  const tokenName = 'MockToken';
  const tokenSymbol = 'MTKN';
  const tokenSupply = web3.utils.toWei('100');
  const proposalThreshold = web3.utils.toWei('10');

  beforeEach(async function () {
    const [ deployer ] = await web3.eth.getAccounts();

    this.token = await Token.new(tokenName, tokenSymbol);

    // Need to predict governance address to set it as timelock admin with a delayed transfer
    const nonce = await web3.eth.getTransactionCount(deployer);
    const predictGovernor = makeContractAddress(deployer, nonce + 1);

    this.timelock = await Timelock.new(predictGovernor, 2 * 86400);
    this.mock = await Governor.new(name, this.token.address, 4, 16, proposalThreshold, this.timelock.address);
    this.receiver = await CallReceiver.new();
    await this.token.mint(owner, tokenSupply);
    await this.token.delegate(voter1, { from: voter1 });
    await this.token.delegate(voter2, { from: voter2 });
    await this.token.delegate(voter3, { from: voter3 });
    await this.token.delegate(voter4, { from: voter4 });

    await this.token.transfer(proposer, proposalThreshold, { from: owner });
    await this.token.delegate(proposer, { from: proposer });
  });

  it('deployment check', async function () {
    expect(await this.mock.name()).to.be.equal(name);
    expect(await this.mock.token()).to.be.equal(this.token.address);
    expect(await this.mock.votingDelay()).to.be.bignumber.equal('4');
    expect(await this.mock.votingPeriod()).to.be.bignumber.equal('16');
    expect(await this.mock.quorum(0)).to.be.bignumber.equal('0');
    expect(await this.mock.quorumVotes()).to.be.bignumber.equal('0');
  });

  describe('nominal', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ], // targets
          [ web3.utils.toWei('0') ], // values
          [ this.receiver.contract.methods.mockFunction().encodeABI() ], // calldatas
          '<proposal description>', // description
        ],
        proposer,
        tokenHolder: owner,
        voters: [
          {
            voter: voter1,
            weight: web3.utils.toWei('1'),
            support: Enums.VoteType.Abstain,
          },
          {
            voter: voter2,
            weight: web3.utils.toWei('10'),
            support: Enums.VoteType.For,
          },
          {
            voter: voter3,
            weight: web3.utils.toWei('5'),
            support: Enums.VoteType.Against,
          },
          {
            voter: voter4,
            support: '100',
            error: 'GovernorCompatibilityBravo: invalid vote type',
          },
          {
            voter: voter1,
            support: Enums.VoteType.For,
            error: 'GovernorCompatibilityBravo: vote already casted',
            skip: true,
          },
        ],
        steps: {
          queue: { delay: 7 * 86400 },
        },
      };
      this.votingDelay = await this.mock.votingDelay();
      this.votingPeriod = await this.mock.votingPeriod();
      this.receipts = {};
    });
    afterEach(async function () {
      const proposal = await this.mock.proposals(this.id);
      expect(proposal.id).to.be.bignumber.equal(this.id);
      expect(proposal.proposer).to.be.equal(proposer);
      expect(proposal.eta).to.be.bignumber.equal(this.eta);
      expect(proposal.startBlock).to.be.bignumber.equal(this.snapshot);
      expect(proposal.endBlock).to.be.bignumber.equal(this.deadline);
      expect(proposal.canceled).to.be.equal(false);
      expect(proposal.executed).to.be.equal(true);

      for (const [key, value] of Object.entries(Enums.VoteType)) {
        expect(proposal[`${key.toLowerCase()}Votes`]).to.be.bignumber.equal(
          Object.values(this.settings.voters).filter(({ support }) => support === value).reduce(
            (acc, { weight }) => acc.add(new BN(weight)),
            new BN('0'),
          ),
        );
      }

      const action = await this.mock.getActions(this.id);
      expect(action.targets).to.be.deep.equal(this.settings.proposal[0]);
      // expect(action.values).to.be.deep.equal(this.settings.proposal[1]);
      expect(action.signatures).to.be.deep.equal(Array(this.settings.proposal[2].length).fill(''));
      expect(action.calldatas).to.be.deep.equal(this.settings.proposal[2]);

      for (const voter of this.settings.voters.filter(({ skip }) => !skip)) {
        expect(await this.mock.hasVoted(this.id, voter.voter)).to.be.equal(voter.error === undefined);

        const receipt = await this.mock.getReceipt(this.id, voter.voter);
        expect(receipt.hasVoted).to.be.equal(voter.error === undefined);
        expect(receipt.support).to.be.bignumber.equal(voter.error === undefined ? voter.support : '0');
        expect(receipt.votes).to.be.bignumber.equal(voter.error === undefined ? voter.weight : '0');
      }

      expectEvent(
        this.receipts.propose,
        'ProposalCreated',
        {
          proposalId: this.id,
          proposer,
          targets: this.settings.proposal[0],
          // values: this.settings.proposal[1].map(value => new BN(value)),
          signatures: this.settings.proposal[2].map(() => ''),
          calldatas: this.settings.proposal[2],
          startBlock: new BN(this.receipts.propose.blockNumber).add(this.votingDelay),
          endBlock: new BN(this.receipts.propose.blockNumber).add(this.votingDelay).add(this.votingPeriod),
          description: this.settings.proposal[3],
        },
      );

      this.receipts.castVote.filter(Boolean).forEach(vote => {
        const { voter } = vote.logs.find(Boolean).args;
        expectEvent(
          vote,
          'VoteCast',
          this.settings.voters.find(({ address }) => address === voter),
        );
      });
      expectEvent(
        this.receipts.execute,
        'ProposalExecuted',
        { proposalId: this.id },
      );
      await expectEvent.inTransaction(
        this.receipts.execute.transactionHash,
        this.receiver,
        'MockFunctionCalled',
      );
    });
    runGovernorWorkflow();
  });

  describe('proposalThreshold not reached', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ], // targets
          [ web3.utils.toWei('0') ], // values
          [ this.receiver.contract.methods.mockFunction().encodeABI() ], // calldatas
          '<proposal description>', // description
        ],
        proposer: other,
        steps: {
          propose: { error: 'GovernorCompatibilityBravo: proposer votes below proposal threshold' },
          wait: { enable: false },
          queue: { enable: false },
          execute: { enable: false },
        },
      };
    });
    runGovernorWorkflow();
  });

  describe('with compatibility interface', function () {
    beforeEach(async function () {
      this.settings = {
        proposal: [
          [ this.receiver.address ], // targets
          [ web3.utils.toWei('0') ], // values
          [ '' ], // signatures
          [ this.receiver.contract.methods.mockFunction().encodeABI() ], // calldatas
          '<proposal description>', // description
        ],
        proposer,
        tokenHolder: owner,
        voters: [
          {
            voter: voter1,
            weight: web3.utils.toWei('1'),
            support: Enums.VoteType.Abstain,
          },
          {
            voter: voter2,
            weight: web3.utils.toWei('10'),
            support: Enums.VoteType.For,
          },
          {
            voter: voter3,
            weight: web3.utils.toWei('5'),
            support: Enums.VoteType.Against,
          },
          {
            voter: voter4,
            support: '100',
            error: 'GovernorCompatibilityBravo: invalid vote type',
          },
          {
            voter: voter1,
            support: Enums.VoteType.For,
            error: 'GovernorCompatibilityBravo: vote already casted',
            skip: true,
          },
        ],
        steps: {
          queue: { delay: 7 * 86400 },
        },
      };
      this.votingDelay = await this.mock.votingDelay();
      this.votingPeriod = await this.mock.votingPeriod();
      this.receipts = {};
    });

    afterEach(async function () {
      const proposal = await this.mock.proposals(this.id);
      expect(proposal.id).to.be.bignumber.equal(this.id);
      expect(proposal.proposer).to.be.equal(proposer);
      expect(proposal.eta).to.be.bignumber.equal(this.eta);
      expect(proposal.startBlock).to.be.bignumber.equal(this.snapshot);
      expect(proposal.endBlock).to.be.bignumber.equal(this.deadline);
      expect(proposal.canceled).to.be.equal(false);
      expect(proposal.executed).to.be.equal(true);

      for (const [key, value] of Object.entries(Enums.VoteType)) {
        expect(proposal[`${key.toLowerCase()}Votes`]).to.be.bignumber.equal(
          Object.values(this.settings.voters).filter(({ support }) => support === value).reduce(
            (acc, { weight }) => acc.add(new BN(weight)),
            new BN('0'),
          ),
        );
      }

      const action = await this.mock.getActions(this.id);
      expect(action.targets).to.be.deep.equal(this.settings.proposal[0]);
      // expect(action.values).to.be.deep.equal(this.settings.proposal[1]);
      expect(action.signatures).to.be.deep.equal(this.settings.proposal[2]);
      expect(action.calldatas).to.be.deep.equal(this.settings.proposal[3]);

      for (const voter of this.settings.voters.filter(({ skip }) => !skip)) {
        expect(await this.mock.hasVoted(this.id, voter.voter)).to.be.equal(voter.error === undefined);

        const receipt = await this.mock.getReceipt(this.id, voter.voter);
        expect(receipt.hasVoted).to.be.equal(voter.error === undefined);
        expect(receipt.support).to.be.bignumber.equal(voter.error === undefined ? voter.support : '0');
        expect(receipt.votes).to.be.bignumber.equal(voter.error === undefined ? voter.weight : '0');
      }

      expectEvent(
        this.receipts.propose,
        'ProposalCreated',
        {
          proposalId: this.id,
          proposer,
          targets: this.settings.proposal[0],
          // values: this.settings.proposal[1].map(value => new BN(value)),
          signatures: this.settings.proposal[2],
          calldatas: this.settings.proposal[3],
          startBlock: new BN(this.receipts.propose.blockNumber).add(this.votingDelay),
          endBlock: new BN(this.receipts.propose.blockNumber).add(this.votingDelay).add(this.votingPeriod),
          description: this.settings.proposal[4],
        },
      );

      this.receipts.castVote.filter(Boolean).forEach(vote => {
        const { voter } = vote.logs.find(Boolean).args;
        expectEvent(
          vote,
          'VoteCast',
          this.settings.voters.find(({ address }) => address === voter),
        );
      });
      expectEvent(
        this.receipts.execute,
        'ProposalExecuted',
        { proposalId: this.id },
      );
      await expectEvent.inTransaction(
        this.receipts.execute.transactionHash,
        this.receiver,
        'MockFunctionCalled',
      );
    });

    it('run', async function () {
      // transfer tokens
      if (tryGet(this.settings, 'voters')) {
        for (const voter of this.settings.voters) {
          if (voter.weight) {
            await this.token.transfer(voter.voter, voter.weight, { from: this.settings.tokenHolder });
          }
        }
      }

      // propose
      if (this.mock.propose && tryGet(this.settings, 'steps.propose.enable') !== false) {
        this.receipts.propose = await getReceiptOrRevert(
          this.mock.methods['propose(address[],uint256[],string[],bytes[],string)'](
            ...this.settings.proposal,
            { from: this.settings.proposer },
          ),
          tryGet(this.settings, 'steps.propose.error'),
        );

        if (tryGet(this.settings, 'steps.propose.error') === undefined) {
          this.id = this.receipts.propose.logs.find(({ event }) => event === 'ProposalCreated').args.proposalId;
          this.snapshot = await this.mock.proposalSnapshot(this.id);
          this.deadline = await this.mock.proposalDeadline(this.id);
        }

        if (tryGet(this.settings, 'steps.propose.delay')) {
          await time.increase(tryGet(this.settings, 'steps.propose.delay'));
        }

        if (
          tryGet(this.settings, 'steps.propose.error') === undefined &&
          tryGet(this.settings, 'steps.propose.noadvance') !== true
        ) {
          await time.advanceBlockTo(this.snapshot);
        }
      }

      // vote
      if (tryGet(this.settings, 'voters')) {
        this.receipts.castVote = [];
        for (const voter of this.settings.voters) {
          if (!voter.signature) {
            this.receipts.castVote.push(
              await getReceiptOrRevert(
                this.mock.castVote(this.id, voter.support, { from: voter.voter }),
                voter.error,
              ),
            );
          } else {
            const { v, r, s } = await voter.signature({ proposalId: this.id, support: voter.support });
            this.receipts.castVote.push(
              await getReceiptOrRevert(
                this.mock.castVoteBySig(this.id, voter.support, v, r, s),
                voter.error,
              ),
            );
          }
          if (tryGet(voter, 'delay')) {
            await time.increase(tryGet(voter, 'delay'));
          }
        }
      }

      // fast forward
      if (tryGet(this.settings, 'steps.wait.enable') !== false) {
        await time.advanceBlockTo(this.deadline);
      }

      // queue
      if (this.mock.queue && tryGet(this.settings, 'steps.queue.enable') !== false) {
        this.receipts.queue = await getReceiptOrRevert(
          this.mock.methods['queue(uint256)'](this.id, { from: this.settings.queuer }),
          tryGet(this.settings, 'steps.queue.error'),
        );
        this.eta = await this.mock.proposalEta(this.id);
        if (tryGet(this.settings, 'steps.queue.delay')) {
          await time.increase(tryGet(this.settings, 'steps.queue.delay'));
        }
      }

      // execute
      if (this.mock.execute && tryGet(this.settings, 'steps.execute.enable') !== false) {
        this.receipts.execute = await getReceiptOrRevert(
          this.mock.methods['execute(uint256)'](this.id, { from: this.settings.executer }),
          tryGet(this.settings, 'steps.execute.error'),
        );
        if (tryGet(this.settings, 'steps.execute.delay')) {
          await time.increase(tryGet(this.settings, 'steps.execute.delay'));
        }
      }
    });
  });
});
