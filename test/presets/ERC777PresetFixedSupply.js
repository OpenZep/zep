const { BN } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const ERC777PresetFixedSupply = artifacts.require('ERC777PresetFixedSupply');

contract('ERC777', function (accounts) {
  const [defaultOperatorA, defaultOperatorB, anyone] = accounts;

  const initialSupply = new BN('10000');
  const name = 'ERC777Preset';
  const symbol = '777P';

  const defaultOperators = [defaultOperatorA, defaultOperatorB];

  context('with default operators', function () {
    beforeEach(async function () {
      this.token = await ERC777PresetFixedSupply.new(name, symbol, initialSupply, defaultOperators);
    });

    describe('token is created', function () {
      it('returns the name', async function () {
        expect(await this.token.name()).to.equal(name);
      });

      it('returns the symbol', async function () {
        expect(await this.token.symbol()).to.equal(symbol);
      });

      it('returns a granularity of 1', async function () {
        expect(await this.token.granularity()).to.be.bignumber.equal('1');
      });

      it('returns the default operators', async function () {
        expect(await this.token.defaultOperators()).to.deep.equal(defaultOperators);
      });

      it('default operators are operators for all accounts', async function () {
        for (const operator of defaultOperators) {
          expect(await this.token.isOperatorFor(operator, anyone)).to.equal(true);
        }
      });

      it('returns the total supply equal to initial supply', async function () {
        expect(await this.token.totalSupply()).to.be.bignumber.equal(initialSupply);
      });

      it('returns 18 when decimals is called', async function () {
        expect(await this.token.decimals()).to.be.bignumber.equal('18');
      });
    });
  });
});
