const { makeInterfaceId } = require('openzeppelin-test-helpers');

const INTERFACES = {
  ERC165: [
    'supportsInterface(bytes4)',
  ],
  ERC721: [
    'balanceOf(address)',
    'ownerOf(uint256)',
    'approve(address,uint256)',
    'getApproved(uint256)',
    'setApprovalForAll(address,bool)',
    'isApprovedForAll(address,address)',
    'transferFrom(address,address,uint256)',
    'safeTransferFrom(address,address,uint256)',
    'safeTransferFrom(address,address,uint256,bytes)',
  ],
  ERC721Enumerable: [
    'totalSupply()',
    'tokenOfOwnerByIndex(address,uint256)',
    'tokenByIndex(uint256)',
  ],
  ERC721Metadata: [
    'name()',
    'symbol()',
    'tokenURI(uint256)',
  ],
  ERC721Exists: [
    'exists(uint256)',
  ],
};

const INTERFACE_IDS = {};
const FN_SIGNATURES = {};
for (const k of Object.getOwnPropertyNames(INTERFACES)) {
  INTERFACE_IDS[k] = makeInterfaceId(INTERFACES[k]);
  for (const fnName of INTERFACES[k]) {
    // the interface id of a single function is equivalent to its function signature
    FN_SIGNATURES[fnName] = makeInterfaceId([fnName]);
  }
}

function shouldSupportInterfaces (interfaces = []) {
  describe('ERC165\'s supportsInterface(bytes4)', function () {
    beforeEach(function () {
      this.contractUnderTest = this.mock || this.token;
    });

    for (const k of interfaces) {
      const interfaceId = INTERFACE_IDS[k];
      describe(k, function () {
        it('should use less than 30k gas', async function () {
          (await this.contractUnderTest.supportsInterface.estimateGas(interfaceId)).should.be.lte(30000);
        });

        it('is supported', async function () {
          (await this.contractUnderTest.supportsInterface(interfaceId)).should.equal(true);
        });
      });
    }
  });
}

module.exports = {
  shouldSupportInterfaces,
};
