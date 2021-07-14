const { BN, expectEvent } = require('@openzeppelin/test-helpers');
const Enums = require('../../helpers/enums');

const {
  runGovernorWorkflow,
} = require('./../GovernorWorkflow.behavior');

const Token = artifacts.require('ERC20VotesCompMock');
const Governor = artifacts.require('GovernorCompMock');
const CallReceiver = artifacts.require('CallReceiverMock');

contract('GovernorComp', function (accounts) {
  const [ owner, voter1, voter2, voter3, voter4 ] = accounts;

  const name = 'OZ-Governor';
  // const version = '1';
  const tokenName = 'MockToken';
  const tokenSymbol = 'MTKN';
  const tokenSupply = web3.utils.toWei('100');

  beforeEach(async function () {
    this.owner = owner;
    this.token = await Token.new(tokenName, tokenSymbol);
    this.mock = await Governor.new(name, this.token.address, 4, 16);
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
  });

  describe('voting with comp token', function () {
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
          { voter: voter2, weight: web3.utils.toWei('10'), support: Enums.VoteType.For },
          { voter: voter3, weight: web3.utils.toWei('5'), support: Enums.VoteType.Against },
          { voter: voter4, weight: web3.utils.toWei('2'), support: Enums.VoteType.Abstain },
        ],
      };
    });
    afterEach(async function () {
      expect(await this.mock.hasVoted(this.id, owner)).to.be.equal(false);
      expect(await this.mock.hasVoted(this.id, voter1)).to.be.equal(true);
      expect(await this.mock.hasVoted(this.id, voter2)).to.be.equal(true);
      expect(await this.mock.hasVoted(this.id, voter3)).to.be.equal(true);
      expect(await this.mock.hasVoted(this.id, voter4)).to.be.equal(true);

      this.receipts.castVote.filter(Boolean).forEach(vote => {
        const { voter } = vote.logs.find(Boolean).args;
        expectEvent(
          vote,
          'VoteCast',
          this.settings.voters.find(({ address }) => address === voter),
        );
      });
      await this.mock.proposalVotes(this.id).then(result => {
        for (const [key, value] of Object.entries(Enums.VoteType)) {
          expect(result[`${key.toLowerCase()}Votes`]).to.be.bignumber.equal(
            Object.values(this.settings.voters).filter(({ support }) => support === value).reduce(
              (acc, { weight }) => acc.add(new BN(weight)),
              new BN('0'),
            ),
          );
        }
      });
    });
    runGovernorWorkflow();
  });
});
