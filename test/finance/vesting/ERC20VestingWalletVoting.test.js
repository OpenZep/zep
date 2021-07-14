const { constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const {
  shouldBehaveLikeVestingWallet,
} = require('./VestingWallet.behavior');

const ERC20VotesMock = artifacts.require('ERC20VotesMock');
const ERC20VestingWalletVoting = artifacts.require('ERC20VestingWalletVoting');

const min = (...args) => args.slice(1).reduce((x, y) => x.lt(y) ? x : y, args[0]);

contract('ERC20VestingWalletVoting', function (accounts) {
  const [ beneficiary, other ] = accounts;

  const amount = web3.utils.toBN(web3.utils.toWei('100'));
  const duration = web3.utils.toBN(4 * 365 * 86400); // 4 years

  beforeEach(async function () {
    this.start = (await time.latest()).addn(3600); // in 1 hour
    this.token = await ERC20VotesMock.new('Name', 'Symbol');
    this.mock = await ERC20VestingWalletVoting.new(beneficiary, this.start, duration);
    await this.token.mint(this.mock.address, amount);
  });

  it('rejects zero address for beneficiary', async function () {
    await expectRevert(
      ERC20VestingWalletVoting.new(constants.ZERO_ADDRESS, this.start, duration),
      'ERC20VestingWallet: beneficiary is zero address',
    );
  });

  it('check vesting contract', async function () {
    expect(await this.mock.beneficiary()).to.be.equal(beneficiary);
    expect(await this.mock.start()).to.be.bignumber.equal(this.start);
    expect(await this.mock.duration()).to.be.bignumber.equal(duration);
  });

  shouldBehaveLikeVestingWallet(
    // makeSchedule
    (env) => Array(256).fill().map((_, i) => web3.utils.toBN(i).mul(duration).divn(224).add(env.start)),
    // vestingFunction
    (env, timestamp) => min(amount, amount.mul(timestamp.sub(env.start)).div(duration)),
    // checkRelease
    (env, { tx }, amount) => Promise.all([
      expectEvent.inTransaction(tx, env.mock, 'TokensReleased', {
        token: env.token.address,
        amount,
      }),
      expectEvent.inTransaction(tx, env.token, 'Transfer', {
        from: env.mock.address,
        to: beneficiary,
        value: amount,
      }),
    ]),
  );

  describe('delegate vote', function () {
    it('wrong caller', async function () {
      expect(await this.token.delegates(this.mock.address)).to.be.equal(constants.ZERO_ADDRESS);

      await expectRevert(
        this.mock.delegate(this.token.address, other, { from: other }),
        'ERC20VestingWallet: access restricted to beneficiary',
      );

      expect(await this.token.delegates(this.mock.address)).to.be.equal(constants.ZERO_ADDRESS);
    });

    it('authorized call', async function () {
      expect(await this.token.delegates(this.mock.address)).to.be.equal(constants.ZERO_ADDRESS);

      const { tx } = await this.mock.delegate(this.token.address, other, { from: beneficiary });
      await expectEvent.inTransaction(tx, this.token, 'DelegateChanged', {
        delegator: this.mock.address,
        fromDelegate: constants.ZERO_ADDRESS,
        toDelegate: other,
      });
      await expectEvent.inTransaction(tx, this.token, 'DelegateVotesChanged', {
        delegate: other,
        previousBalance: '0',
        newBalance: amount,
      });

      expect(await this.token.delegates(this.mock.address)).to.be.equal(other);
    });
  });
});
