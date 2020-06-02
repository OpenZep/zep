const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectEvent } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const { shouldBehaveLikeERC1155 } = require('./ERC1155.behavior');
const ERC1155Mock = contract.fromArtifact('ERC1155Mock');

describe('ERC1155MetadataURICatchAll', function () {
  const [creator, ...otherAccounts] = accounts;

  const uriInit = 'https://example.com/{id}.json';
  const tokenId = new BN(0); // catch-all always uses id 0 in event

  beforeEach(async function () {
    this.token = await ERC1155Mock.new(uriInit, { from: creator });
  });

  it('emits no URI events in constructor', async function () {
    await expectEvent.notEmitted.inConstruction(this.token, 'URI');
  });

  shouldBehaveLikeERC1155(otherAccounts);

  it('has a uri', async function () {
    expect(await this.token.uri(
      tokenId
    )).to.be.equal(uriInit);
  });

  describe('internal functions', function () {
    const uriNew = 'https://example.com/{locale}/{id}.json';

    describe('_setURI(string memory newuri)', function () {
      let receipt;
      beforeEach(async function () {
        receipt = await this.token.setURI(
          uriNew,
          { from: creator }
        );
      });

      it('emits no URI event', function () {
        expectEvent.notEmitted(receipt, 'URI');
      });

      it('has correct URI set', async function () {
        expect(await this.token.uri(
          tokenId
        )).to.be.equal(uriNew);
      });
    });
  });
});
