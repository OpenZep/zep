# Changelog

## Unreleased

 * `ERC2771Context`: use private variable from storage to store the forwarder address. Fixes issues where `_msgSender()` was not callable from constructors. ([#2754](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2754))
 * `EnumerableSet`: add `values()` functions that returns an array containing all values in a single call. ([#2768](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2768))

## 4.2.0 (2021-06-30)

 * `ERC20Votes`: add a new extension of the `ERC20` token with support for voting snapshots and delegation. ([#2632](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2632))
 * `ERC20VotesComp`: Variant of `ERC20Votes` that is compatible with Compound's `Comp` token interface but restricts supply to `uint96`. ([#2706](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2706))
 * `ERC20Wrapper`: add a new extension of the `ERC20` token which wraps an underlying token. Deposit and withdraw guarantee that the total supply is backed by a corresponding amount of underlying token. ([#2633](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2633))
 * Enumerables: Improve gas cost of removal in `EnumerableSet` and `EnumerableMap`.
 * Enumerables: Improve gas cost of lookup in `EnumerableSet` and `EnumerableMap`.
 * `Counter`: add a reset method. ([#2678](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2678))
 * Tokens: Wrap definitely safe subtractions in `unchecked` blocks.
 * `Math`: Add a `ceilDiv` method for performing ceiling division.
 * `ERC1155Supply`: add a new `ERC1155` extension that keeps track of the totalSupply of each tokenId. ([#2593](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2593))
 * `BitMaps`: add a new `BitMaps` library that provides a storage efficient datastructure for `uint256` to `bool` mapping with contiguous keys. ([#2710](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2710))

 ### Breaking Changes

 * `ERC20FlashMint` is no longer a Draft ERC. ([#2673](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2673)))

**How to update:** Change your import paths by removing the `draft-` prefix from `@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20FlashMint.sol`.

> See [Releases and Stability: Drafts](https://docs.openzeppelin.com/contracts/4.x/releases-stability#drafts).

## 4.1.0 (2021-04-29)

 * `IERC20Metadata`: add a new extended interface that includes the optional `name()`, `symbol()` and `decimals()` functions. ([#2561](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2561))
 * `ERC777`: make reception acquirement optional in `_mint`. ([#2552](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2552))
 * `ERC20Permit`: add a `_useNonce` to enable further usage of ERC712 signatures. ([#2565](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2565))
 * `ERC20FlashMint`: add an implementation of the ERC3156 extension for flash-minting ERC20 tokens. ([#2543](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2543))
 * `SignatureChecker`: add a signature verification library that supports both EOA and ERC1271 compliant contracts as signers. ([#2532](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2532))
 * `Multicall`: add abstract contract with `multicall(bytes[] calldata data)` function to bundle multiple calls together ([#2608](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2608))
 * `ECDSA`: add support for ERC2098 short-signatures. ([#2582](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2582))
 * `AccessControl`: add a `onlyRole` modifier to restrict specific function to callers bearing a specific role. ([#2609](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2609))
 * `StorageSlot`: add a library for reading and writing primitive types to specific storage slots. ([#2542](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2542))
 * UUPS Proxies: add `UUPSUpgradeable` to implement the UUPS proxy pattern together with `EIP1967Proxy`. ([#2542](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2542))

### Breaking changes

This release includes two small breaking changes in `TimelockController`.

1. The `onlyRole` modifier in this contract was designed to let anyone through if the role was granted to `address(0)`,
   allowing the possibility to to make a role "open", which can be used for `EXECUTOR_ROLE`. This modifier is now
   replaced by `AccessControl.onlyRole`, which does not have this ability. The previous behavior was moved to the
   modifier `TimelockController.onlyRoleOrOpenRole`.
2. It was possible to make `PROPOSER_ROLE` an open role (as described in the previous item) if it was granted to
   `address(0)`. This would affect the `schedule`, `scheduleBatch`, and `cancel` operations in `TimelockController`.
   This ability was removed as it does not make sense to open up the `PROPOSER_ROLE` in the same way that it does for
   `EXECUTOR_ROLE`.

## 4.0.0 (2021-03-23)

 * Now targeting the 0.8.x line of Solidity compilers. For 0.6.x (resp 0.7.x) support, use version 3.4.0 (resp 3.4.0-solc-0.7) of OpenZeppelin.
 * `Context`: making `_msgData` return `bytes calldata` instead of `bytes memory` ([#2492](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2492))
 * `ERC20`: removed the `_setDecimals` function and the storage slot associated to decimals. ([#2502](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2502))
 * `Strings`: addition of a `toHexString` function.  ([#2504](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2504))
 * `EnumerableMap`: change implementation to optimize for `key → value` lookups instead of enumeration. ([#2518](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2518))
 * `GSN`: deprecate GSNv1 support in favor of upcoming support for GSNv2. ([#2521](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2521))
 * `ERC165`: remove uses of storage in the base ERC165 implementation. ERC165 based contracts now use storage-less virtual functions. Old behavior remains available in the `ERC165Storage` extension. ([#2505](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2505))
 * `Initializable`: make initializer check stricter during construction. ([#2531](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2531))
 * `ERC721`: remove enumerability of tokens from the base implementation. This feature is now provided separately through the `ERC721Enumerable` extension. ([#2511](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2511))
 * `AccessControl`: removed enumerability by default for a more lightweight contract. It is now opt-in through `AccessControlEnumerable`. ([#2512](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2512))
 * Meta Transactions: add `ERC2771Context` and a `MinimalForwarder` for meta-transactions. ([#2508](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2508))
 * Overall reorganization of the contract folder to improve clarity and discoverability. ([#2503](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2503))
 * `ERC20Capped`: optimize gas usage by enforcing the check directly in `_mint`. ([#2524](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2524))
 * Rename `UpgradeableProxy` to `ERC1967Proxy`. ([#2547](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2547))
 * `ERC777`: optimize the gas costs of the constructor. ([#2551](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2551))
 * `ERC721URIStorage`: add a new extension that implements the `_setTokenURI` behavior as it was available in 3.4.0. ([#2555](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2555))
 * `AccessControl`: added ERC165 interface detection. ([#2562](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2562))
 * `ERC1155`: make `uri` public so overloading function can call it using super. ([#2576](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2576))

### Bug fixes for beta releases

 * `AccessControlEnumerable`: Fixed `renounceRole` not updating enumerable set of addresses for a role. ([#2572](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2572))

### How to upgrade from 3.x

Since this version has moved a few contracts to different directories, users upgrading from a previous version will need to adjust their import statements. To make this easier, the package includes a script that will migrate import statements automatically. After upgrading to the latest version of the package, run:

```
npx openzeppelin-contracts-migrate-imports
```

Make sure you're using git or another version control system to be able to recover from any potential error in our script.

### How to upgrade from 4.0-beta.x

Some further changes have been done between the different beta iterations. Transitions made during this period are configured in the `migrate-imports` script. Consequently, you can upgrade from any previous 4.0-beta.x version using the same script as described in the *How to upgrade from 3.x* section.

## 3.4.0 (2021-02-02)

 * `BeaconProxy`: added new kind of proxy that allows simultaneous atomic upgrades. ([#2411](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2411))
 * `EIP712`: added helpers to verify EIP712 typed data signatures on chain. ([#2418](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2418))
 * `ERC20Permit`: added an implementation of the ERC20 permit extension for gasless token approvals. ([#2237](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2237))
 * Presets: added token presets with preminted fixed supply `ERC20PresetFixedSupply` and `ERC777PresetFixedSupply`. ([#2399](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2399))
 * `Address`: added `functionDelegateCall`, similar to the existing `functionCall`. ([#2333](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2333))
 * `Clones`: added a library for deploying EIP 1167 minimal proxies. ([#2449](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2449))
 * `Context`: moved from `contracts/GSN` to `contracts/utils`. ([#2453](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2453))
 * `PaymentSplitter`: replace usage of `.transfer()` with `Address.sendValue` for improved compatibility with smart wallets. ([#2455](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2455))
 * `UpgradeableProxy`: bubble revert reasons from initialization calls. ([#2454](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2454))
 * `SafeMath`: fix a memory allocation issue by adding new `SafeMath.tryOp(uint,uint)→(bool,uint)` functions. `SafeMath.op(uint,uint,string)→uint` are now deprecated. ([#2462](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2462))
 * `EnumerableMap`: fix a memory allocation issue by adding new `EnumerableMap.tryGet(uint)→(bool,address)` functions. `EnumerableMap.get(uint)→string` is now deprecated. ([#2462](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2462))
 * `ERC165Checker`: added batch `getSupportedInterfaces`. ([#2469](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2469))
 * `RefundEscrow`: `beneficiaryWithdraw` will forward all available gas to the beneficiary. ([#2480](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2480))
 * Many view and pure functions have been made virtual to customize them via overrides. In many cases this will not imply that other functions in the contract will automatically adapt to the overridden definitions. People who wish to override should consult the source code to understand the impact and if they need to override any additional functions to achieve the desired behavior.

### Security Fixes

 * `ERC777`: fix potential reentrancy issues for custom extensions to `ERC777`. ([#2483](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2483))

If you're using our implementation of ERC777 from version 3.3.0 or earlier, and you define a custom `_beforeTokenTransfer` function that writes to a storage variable, you may be vulnerable to a reentrancy attack. If you're affected and would like assistance please write to security@openzeppelin.com. [Read more in the pull request.](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2483)

## 3.3.0 (2020-11-26)

 * Now supports both Solidity 0.6 and 0.7. Compiling with solc 0.7 will result in warnings. Install the `solc-0.7` tag to compile without warnings.
 * `Address`: added `functionStaticCall`, similar to the existing `functionCall`. ([#2333](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2333))
 * `TimelockController`: added a contract to augment access control schemes with a delay. ([#2354](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2354))
 * `EnumerableSet`: added `Bytes32Set`, for sets of `bytes32`. ([#2395](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2395))

## 3.2.2-solc-0.7 (2020-10-28)
 * Resolve warnings introduced by Solidity 0.7.4. ([#2396](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2396))

## 3.2.1-solc-0.7 (2020-09-15)
 * `ERC777`: Remove a warning about function state visibility in Solidity 0.7. ([#2327](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2327))

## 3.2.0 (2020-09-10)

### New features
 * Proxies: added the proxy contracts from OpenZeppelin SDK. ([#2335](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2335))

#### Proxy changes with respect to OpenZeppelin SDK

Aside from upgrading them from Solidity 0.5 to 0.6, we've changed a few minor things from the proxy contracts as they were found in OpenZeppelin SDK.

- `UpgradeabilityProxy` was renamed to `UpgradeableProxy`.
- `AdminUpgradeabilityProxy` was renamed to `TransparentUpgradeableProxy`.
- `Proxy._willFallback` was renamed to `Proxy._beforeFallback`.
- `UpgradeabilityProxy._setImplementation` and `AdminUpgradeabilityProxy._setAdmin` were made private.

### Improvements
 * `Address.isContract`: switched from `extcodehash` to `extcodesize` for less gas usage. ([#2311](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2311))

### Breaking changes
 * `ERC20Snapshot`: switched to using `_beforeTokenTransfer` hook instead of overriding ERC20 operations. ([#2312](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2312))

This small change in the way we implemented `ERC20Snapshot` may affect users who are combining this contract with
other ERC20 flavors, since it no longer overrides `_transfer`, `_mint`, and `_burn`. This can result in having to remove Solidity `override(...)` specifiers in derived contracts for these functions, and to instead have to add it for `_beforeTokenTransfer`. See [Using Hooks](https://docs.openzeppelin.com/contracts/3.x/extending-contracts#using-hooks) in the documentation.

## 3.1.0 (2020-06-23)

### New features
 * `SafeCast`: added functions to downcast signed integers (e.g. `toInt32`), improving usability of `SignedSafeMath`. ([#2243](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2243))
 * `functionCall`: new helpers that replicate Solidity's function call semantics, reducing the need to rely on `call`. ([#2264](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2264))
 * `ERC1155`: added support for a base implementation, non-standard extensions and a preset contract. ([#2014](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2014), [#2230](https://github.com/OpenZeppelin/openzeppelin-contracts/issues/2230))

### Improvements
 * `ReentrancyGuard`: reduced overhead of using the `nonReentrant` modifier. ([#2171](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2171))
 * `AccessControl`: added a `RoleAdminChanged` event to `_setAdminRole`. ([#2214](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2214))
 * Made all `public` functions in the token preset contracts `virtual`. ([#2257](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2257))

### Deprecations
 * `SafeERC20`: deprecated `safeApprove`. ([#2268](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2268))

## 3.0.2 (2020-06-08)

### Improvements
 * Added SPX license identifier to all contracts. ([#2235](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2235))

## 3.0.1 (2020-04-27)

### Bugfixes
 * `ERC777`: fixed the `_approve` internal function not validating some of their arguments for non-zero addresses. ([#2213](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2213))

## 3.0.0 (2020-04-20)

### New features
 * `AccessControl`: new contract for managing permissions in a system, replacement for `Ownable` and `Roles`. ([#2112](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2112))
 * `SafeCast`: new functions to convert to and from signed and unsigned values: `toUint256` and `toInt256`. ([#2123](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2123))
 * `EnumerableMap`: a new data structure for key-value pairs (like `mapping`) that can be iterated over. ([#2160](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2160))

### Breaking changes
 * `ERC721`: `burn(owner, tokenId)` was removed, use `burn(tokenId)` instead. ([#2125](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2125))
 * `ERC721`: `_checkOnERC721Received` was removed. ([#2125](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2125))
 * `ERC721`: `_transferFrom` and `_safeTransferFrom` were renamed to `_transfer` and `_safeTransfer`. ([#2162](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2162))
 * `Ownable`: removed `_transferOwnership`. ([#2162](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2162))
 * `PullPayment`, `Escrow`: `withdrawWithGas` was removed. The old `withdraw` function now forwards all gas. ([#2125](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2125))
 * `Roles` was removed, use `AccessControl` as a replacement. ([#2112](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2112))
 * `ECDSA`: when receiving an invalid signature, `recover` now reverts instead of returning the zero address. ([#2114](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2114))
 * `Create2`: added an `amount` argument to `deploy` for contracts with `payable` constructors. ([#2117](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2117))
 * `Pausable`: moved to the `utils` directory. ([#2122](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2122))
 * `Strings`: moved to the `utils` directory. ([#2122](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2122))
 * `Counters`: moved to the `utils` directory. ([#2122](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2122))
 * `SignedSafeMath`: moved to the `math` directory. ([#2122](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2122))
 * `ERC20Snapshot`: moved to the `token/ERC20` directory. `snapshot` was changed into an `internal` function. ([#2122](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2122))
 * `Ownable`: moved to the `access` directory. ([#2120](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2120))
 * `Ownable`: removed `isOwner`. ([#2120](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2120))
 * `Secondary`: removed from the library, use `Ownable` instead. ([#2120](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2120))
 * `Escrow`, `ConditionalEscrow`, `RefundEscrow`: these now use `Ownable` instead of `Secondary`, their external API changed accordingly. ([#2120](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2120))
 * `ERC20`: removed `_burnFrom`. ([#2119](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2119))
 * `Address`: removed `toPayable`, use `payable(address)` instead. ([#2133](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2133))
 * `ERC777`: `_send`, `_mint` and `_burn` now use the caller as the operator. ([#2134](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2134))
 * `ERC777`: removed `_callsTokensToSend` and `_callTokensReceived`. ([#2134](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2134))
 * `EnumerableSet`: renamed `get` to `at`. ([#2151](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2151))
 * `ERC165Checker`: functions no longer have a leading underscore. ([#2150](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2150))
 * `ERC721Metadata`, `ERC721Enumerable`: these contracts were removed, and their functionality merged into `ERC721`. ([#2160](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2160))
 * `ERC721`: added a constructor for `name` and `symbol`. ([#2160](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2160))
 * `ERC20Detailed`: this contract was removed and its functionality merged into `ERC20`. ([#2161](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2161))
 * `ERC20`: added a constructor for `name` and `symbol`. `decimals` now defaults to 18. ([#2161](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2161))
 * `Strings`: renamed `fromUint256` to `toString` ([#2188](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2188))

## 2.5.1 (2020-04-24)

### Bugfixes
 * `ERC777`: fixed the `_send` and `_approve` internal functions not validating some of their arguments for non-zero addresses. ([#2212](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2212))

## 2.5.0 (2020-02-04)

### New features
 * `SafeCast.toUintXX`: new library for integer downcasting, which allows for safe operation on smaller types (e.g. `uint32`) when combined with `SafeMath`. ([#1926](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1926))
 * `ERC721Metadata`: added `baseURI`, which can be used for dramatic gas savings when all token URIs share a prefix (e.g. `http://api.myapp.com/tokens/<id>`). ([#1970](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1970))
 * `EnumerableSet`: new library for storing enumerable sets of values. Only `AddressSet` is supported in this release. ([#2061](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/2061))
 * `Create2`: simple library to make usage of the `CREATE2` opcode easier. ([#1744](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/1744))

### Improvements
 * `ERC777`: `_burn` is now internal, providing more flexibility and making it easier to create tokens that deflate. ([#1908](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/1908))
 * `ReentrancyGuard`: greatly improved gas efficiency by using the net gas metering mechanism introduced in the Istanbul hardfork. ([#1992](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/1992), [#1996](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/1996))
 * `ERC777`: improve extensibility by making `_send` and related functions `internal`. ([#2027](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2027))
 * `ERC721`: improved revert reason when transferring tokens to a non-recipient contract. ([#2018](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/2018))

### Breaking changes
 * `ERC165Checker` now requires a minimum Solidity compiler version of 0.5.10. ([#1829](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1829))

## 2.4.0 (2019-10-29)

### New features
 * `Address.toPayable`: added a helper to convert between address types without having to resort to low-level casting. ([#1773](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1773))
 * Facilities to make metatransaction-enabled contracts through the Gas Station Network. ([#1844](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/1844))
 * `Address.sendValue`: added a replacement to Solidity's `transfer`, removing the fixed gas stipend. ([#1962](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1962))
 * Added replacement for functions that don't forward all gas (which have been deprecated): ([#1976](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1976))
   * `PullPayment.withdrawPaymentsWithGas(address payable payee)`
   * `Escrow.withdrawWithGas(address payable payee)`
 * `SafeMath`: added support for custom error messages to `sub`, `div` and `mod` functions. ([#1828](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/1828))

### Improvements
 * `Address.isContract`: switched from `extcodesize` to `extcodehash` for less gas usage. ([#1802](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1802))
 * `ERC20` and `ERC777` updated to throw custom errors on subtraction overflows. ([#1828](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/1828))

### Deprecations
 * Deprecated functions that don't forward all gas: ([#1976](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1976))
   * `PullPayment.withdrawPayments(address payable payee)`
   * `Escrow.withdraw(address payable payee)`

### Breaking changes
 * `Address` now requires a minimum Solidity compiler version of 0.5.5. ([#1802](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1802))
 * `SignatureBouncer` has been removed from drafts, both to avoid confusions with the GSN and `GSNRecipientSignature` (previously called `GSNBouncerSignature`) and because the API was not very clear. ([#1879](https://github.com/OpenZeppelin/openzeppelin-contracts/pull/1879))

### How to upgrade from 2.4.0-beta

The final 2.4.0 release includes a refactor of the GSN contracts that will be a breaking change for 2.4.0-beta users.

 * The default empty implementations of `_preRelayedCall` and `_postRelayedCall` were removed and must now be explicitly implemented always in custom recipients. If your custom recipient didn't include an implementation, you can provide an empty one.
 * `GSNRecipient`, `GSNBouncerBase`, and `GSNContext` were all merged into `GSNRecipient`.
 * `GSNBouncerSignature` and `GSNBouncerERC20Fee` were renamed to `GSNRecipientSignature` and `GSNRecipientERC20Fee`.
 * It is no longer necessary to inherit from `GSNRecipient` when using `GSNRecipientSignature` and `GSNRecipientERC20Fee`.

For example, a contract using `GSNBouncerSignature` would have to be changed in the following way.

```diff
-contract MyDapp is GSNRecipient, GSNBouncerSignature {
+contract MyDapp is GSNRecipientSignature {
```

Refer to the table below to adjust your inheritance list.

| 2.4.0-beta                         | 2.4.0                        |
| ---------------------------------- | ---------------------------- |
| `GSNRecipient, GSNBouncerSignature`| `GSNRecipientSignature`      |
| `GSNRecipient, GSNBouncerERC20Fee` | `GSNRecipientERC20Fee`       |
| `GSNBouncerBase`                   | `GSNRecipient`               |

## 2.3.0 (2019-05-27)

### New features
 * `ERC1820`: added support for interacting with the [ERC1820](https://eips.ethereum.org/EIPS/eip-1820) registry contract (`IERC1820Registry`), as well as base contracts that can be registered as implementers there. ([#1677](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1677))
 * `ERC777`: support for the [ERC777 token](https://eips.ethereum.org/EIPS/eip-777), which has multiple improvements over `ERC20` (but is backwards compatible with it) such as built-in burning, a more  straightforward permission system, and optional sender and receiver hooks on transfer (mandatory for contracts!). ([#1684](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1684))
 * All contracts now have revert reason strings, which give insight into error conditions, and help debug failing transactions. ([#1704](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1704))

### Improvements
 * Reverted the Solidity version bump done in v2.2.0, setting the minimum compiler version to v0.5.0, to prevent unexpected build breakage. Users are encouraged however to stay on top of new compiler releases, which usually include bugfixes. ([#1729](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1729))

### Bugfixes
 * `PostDeliveryCrowdsale`: some validations where skipped when paired with other crowdsale flavors, such as `AllowanceCrowdsale`, or `MintableCrowdsale` and `ERC20Capped`, which could cause buyers to not be able to claim their purchased tokens. ([#1721](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1721))
 * `ERC20._transfer`: the `from` argument was allowed to be the zero address, so it was possible to internally trigger a transfer of 0 tokens from the zero address. This address is not a valid destinatary of transfers, nor can it give or receive allowance, so this behavior was inconsistent. It now reverts. ([#1752](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1752))

## 2.2.0 (2019-03-14)

### New features
 * `ERC20Snapshot`: create snapshots on demand of the token balances and total supply, to later retrieve and e.g. calculate dividends at a past time. ([#1617](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1617))
 * `SafeERC20`: `ERC20` contracts with no return value (i.e. that revert on failure) are now supported. ([#1655](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1655))
 * `ERC20`: added internal `_approve(address owner, address spender, uint256 value)`, allowing derived contracts to set the allowance of arbitrary accounts. ([#1609](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1609))
 * `ERC20Metadata`: added internal `_setTokenURI(string memory tokenURI)`. ([#1618](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1618))
 * `TimedCrowdsale`: added internal `_extendTime(uint256 newClosingTime)` as well as `TimedCrowdsaleExtended(uint256 prevClosingTime, uint256 newClosingTime)` event allowing to extend the crowdsale, as long as it hasn't already closed.

### Improvements
 * Upgraded the minimum compiler version to v0.5.2: this removes many Solidity warnings that were false positives. ([#1606](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1606))
 * `ECDSA`: `recover` no longer accepts malleable signatures (those using upper-range values for `s`, or 0/1 for `v`). ([#1622](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1622))
 * ``ERC721``'s transfers are now more gas efficient due to removal of unnecessary `SafeMath` calls. ([#1610](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1610))
 * Fixed variable shadowing issues. ([#1606](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1606))

### Bugfixes
 * (minor) `SafeERC20`: `safeApprove` wasn't properly checking for a zero allowance when attempting to set a non-zero allowance. ([#1647](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1647))

### Breaking changes in drafts
 * `TokenMetadata` has been renamed to `ERC20Metadata`. ([#1618](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1618))
 * The library `Counter` has been renamed to `Counters` and its API has been improved. See an example in `ERC721`, lines [17](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/3cb4a00fce1da76196ac0ac3a0ae9702b99642b5/contracts/token/ERC721/ERC721.sol#L17) and [204](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/3cb4a00fce1da76196ac0ac3a0ae9702b99642b5/contracts/token/ERC721/ERC721.sol#L204). ([#1610](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1610))

## 2.1.3 (2019-02-26)
 * Backported `SafeERC20.safeApprove` bugfix. ([#1647](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1647))

## 2.1.2 (2019-01-17)
 * Removed most of the test suite from the npm package, except `PublicRole.behavior.js`, which may be useful to users testing their own `Roles`.

## 2.1.1 (2019-01-04)
 * Version bump to avoid conflict in the npm registry.

## 2.1.0 (2019-01-04)

### New features
 * Now targeting the 0.5.x line of Solidity compilers. For 0.4.24 support, use version 2.0 of OpenZeppelin.
 * `WhitelistCrowdsale`: a crowdsale where only whitelisted accounts (`WhitelistedRole`) can purchase tokens. Adding or removing accounts from the whitelist is done by whitelist admins (`WhitelistAdminRole`). Similar to the pre-2.0 `WhitelistedCrowdsale`. ([#1525](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1525), [#1589](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1589))
 * `RefundablePostDeliveryCrowdsale`: replacement for `RefundableCrowdsale` (deprecated, see below) where tokens are only granted once the crowdsale ends (if it meets its goal). ([#1543](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1543))
 * `PausableCrowdsale`: allows for pausers (`PauserRole`) to pause token purchases. Other crowdsale operations (e.g. withdrawals and refunds, if applicable) are not affected. ([#832](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/832))
 * `ERC20`: `transferFrom` and `_burnFrom ` now emit `Approval` events, to represent the token's state comprehensively through events. ([#1524](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1524))
 * `ERC721`: added `_burn(uint256 tokenId)`, replacing the similar deprecated function (see below). ([#1550](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1550))
 * `ERC721`: added `_tokensOfOwner(address owner)`, allowing to internally retrieve the array of an account's owned tokens. ([#1522](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1522))
 * Crowdsales: all constructors are now `public`, meaning it is not necessary to extend these contracts in order to deploy them. The exception is `FinalizableCrowdsale`, since it is meaningless unless extended. ([#1564](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1564))
 * `SignedSafeMath`: added overflow-safe operations for signed integers (`int256`). ([#1559](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1559), [#1588](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1588))

### Improvements
 * The compiler version required by `Array` was behind the rest of the libray so it was updated to `v0.4.24`. ([#1553](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1553))
 * Now conforming to a 4-space indentation code style. ([1508](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1508))
 * `ERC20`: more gas efficient due to removed redundant `require`s. ([#1409](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1409))
 * `ERC721`: fixed a bug that prevented internal data structures from being properly cleaned, missing potential gas refunds. ([#1539](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1539) and [#1549](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1549))
 * `ERC721`: general gas savings on `transferFrom`, `_mint` and `_burn`, due to redudant `require`s and `SSTORE`s. ([#1549](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1549))

### Bugfixes

### Breaking changes

### Deprecations
 * `ERC721._burn(address owner, uint256 tokenId)`: due to the `owner` parameter being unnecessary. ([#1550](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1550))
 * `RefundableCrowdsale`: due to trading abuse potential on crowdsales that miss their goal. ([#1543](https://github.com/OpenZeppelin/openzeppelin-solidity/pull/1543))
