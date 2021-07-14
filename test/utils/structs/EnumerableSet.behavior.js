const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

function shouldBehaveLikeSet (valueA, valueB, valueC) {
  async function expectMembersMatch (set, values) {
    await Promise.all(values.map(value => set.contains(value)))
      .then(contains => expect(contains.every(Boolean)).to.be.equal(true));

    await set.length()
      .then(length => expect(length).to.bignumber.equal(values.length.toString()));

    // To compare values we convert to strings to workaround Chai
    // limitations when dealing with nested arrays (required for BNs)
    await Promise.all(Array(values.length).fill().map((_, index) => set.at(index)))
      .then(results => expect(
        results.map(v => v.toString()),
      ).to.have.same.members(
        values.map(v => v.toString()),
      ));

    await set.values()
      .then(results => expect(
        results.map(v => v.toString()),
      ).to.have.same.members(
        values.map(v => v.toString()),
      ));
  }

  it('starts empty', async function () {
    expect(await this.set.contains(valueA)).to.equal(false);

    await expectMembersMatch(this.set, []);
  });

  describe('add', function () {
    it('adds a value', async function () {
      const receipt = await this.set.add(valueA);
      expectEvent(receipt, 'OperationResult', { result: true });

      await expectMembersMatch(this.set, [valueA]);
    });

    it('adds several values', async function () {
      await this.set.add(valueA);
      await this.set.add(valueB);

      await expectMembersMatch(this.set, [valueA, valueB]);
      expect(await this.set.contains(valueC)).to.equal(false);
    });

    it('returns false when adding values already in the set', async function () {
      await this.set.add(valueA);

      const receipt = (await this.set.add(valueA));
      expectEvent(receipt, 'OperationResult', { result: false });

      await expectMembersMatch(this.set, [valueA]);
    });
  });

  describe('at', function () {
    it('reverts when retrieving non-existent elements', async function () {
      await expectRevert.unspecified(this.set.at(0));
    });
  });

  describe('remove', function () {
    it('removes added values', async function () {
      await this.set.add(valueA);

      const receipt = await this.set.remove(valueA);
      expectEvent(receipt, 'OperationResult', { result: true });

      expect(await this.set.contains(valueA)).to.equal(false);
      await expectMembersMatch(this.set, []);
    });

    it('returns false when removing values not in the set', async function () {
      const receipt = await this.set.remove(valueA);
      expectEvent(receipt, 'OperationResult', { result: false });

      expect(await this.set.contains(valueA)).to.equal(false);
    });

    it('adds and removes multiple values', async function () {
      // []

      await this.set.add(valueA);
      await this.set.add(valueC);

      // [A, C]

      await this.set.remove(valueA);
      await this.set.remove(valueB);

      // [C]

      await this.set.add(valueB);

      // [C, B]

      await this.set.add(valueA);
      await this.set.remove(valueC);

      // [A, B]

      await this.set.add(valueA);
      await this.set.add(valueB);

      // [A, B]

      await this.set.add(valueC);
      await this.set.remove(valueA);

      // [B, C]

      await this.set.add(valueA);
      await this.set.remove(valueB);

      // [A, C]

      await expectMembersMatch(this.set, [valueA, valueC]);

      expect(await this.set.contains(valueB)).to.equal(false);
    });
  });
}

module.exports = {
  shouldBehaveLikeSet,
};
