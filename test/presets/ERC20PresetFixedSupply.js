const { BN, constants, expectEvent } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const ERC20PresetFixedSupply = artifacts.require('ERC20PresetFixedSupply');

contract('ERC20PresetFixedSupply', function (accounts) {
  const [deployer] = accounts;

  const name = 'PresetFixedSupply';
  const symbol = 'PFS';

  const intialSupply = new BN('50000');

  beforeEach(async function () {
    this.token = await ERC20PresetFixedSupply.new(name, symbol, intialSupply, { from: deployer });
  });

  it('deployer has the balance equal to initial supply', async function () {
    expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal(intialSupply);
  });

  describe('burning', function () {
    it('holders can burn their tokens', async function () {
      const amount = new BN('10000');
      const remainingBalance = intialSupply.sub(amount);
      const receipt = await this.token.burn(amount, { from: deployer });
      expectEvent(receipt, 'Transfer', { from: deployer, to: ZERO_ADDRESS, value: amount });
      expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal(remainingBalance);
    });
  });
});
