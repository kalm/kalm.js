# Changelog

## [v8.0.0] - 2025-07-30

commit [#](https://github.com/kalm/kalm.js/commits)

### Breaking changes

- Updated bundling for greater compatibility (exports *may* behave differently)
- Deprecated the WebRTC Transport (too convoluted to fit the Kalm model)
- Changed the signature of the `frame` event handler from `(frame: RawFrame, payloadBytes: number)` to `({ body: RawFrame, payloadBytes: number})` to ensure all event handlers only have one arguments.

### Minor changes

- Added support for the new native WS APIs in Node 22 and later
- Removed yarn from the toolchain. There's no reason to keep it now that NPM workspaces are more mature.
- Deprecated the `agent` property for the WS Transport
- Migrated the underlying Node EventEmitter to the cross-platform EventTarget system. A translation layer should keep end-user code intact.
- Fixed server connections not getting cleaned up
- Removed empty channels from frame payloads, saving bandwidth
- Changed the subscribe handler's second argument name from `frame` to `context`, to reduce confusion with its nested `frame` property.
- Fixed missing UDP client `connect` event. 
- Removed the potentially misleading argument in the `connect` event since it only exposes the unbound socket.
- Bumped engines requirement to Node 20.x 


## [v7.0.0] - 2023-03-17

commit [99a3ab9](https://github.com/kalm/kalm.js/commit/99a3ab9c495f6f50d7d4b4a0f478a213cc0ce484)

### Major changes

- Standardized parameter names and expected behavior
  - Removed `secure` WS option, instead checking if `cert` and `key` are set
  - Routines.dynamic option `hz` is now `maxInterval` and is measured in milliseconds
  - Renamed `provider` internally to `server` for easier understanding
  - Removed previously deprecated UDP `connectTimeout` option
- Added UDP idle timeout behavior
- Added WS idle timeout behavior
- Added WS Agent option for proxying
- frameId counter now goes up to 0xffffffff before cycling instead of 0xffff

### Bug fixes

- Fixed an issue in Routines.tick where all queues shared the same frameId counter
- Routines.tick option `seed` now correctly sets the `frameId` and starts the counter to match the expected pace
- Fixed references to Node modules in TS definitions

## [v6.1.0] - 2022-09-21

commit [a0e88e3](https://github.com/kalm/kalm.js/commit/a0e88e310d98646b53fbcc56f6efeea4db5e87d8)

### Major changes

- Removed SYN/ACK UDP handshake, which removes the socket timeout behaviour for that transport
- Added error event for UDP packet over the safe limit (16384 bytes), previous behaviour was to crash silently
- Routines are no longer event emitters, but have a size function


## [v6.0.0] - 2021-04-26

commit: [47b810d](https://github.com/kalm/kalm.js/commit/47b810d5ab212686c3194d53e781e1728bd735f9)

### Breaking changes

- Client.remote is now a const instead of a function (breaking change)
- Client.local is now a const instead of a function (breaking change)
- Engines config in package.json now only allows node >=14

### Added

- Client reference in subscribe callback is now fully featured instead of a shallow config object.
- Bumped `ws` version
- Added integration tests

### Bug fixes

- Fixed importing when using typescript (breaking change)
- Fixed socket remote info
- Fixed multiple types, including opening `port` value to be a string 

## [v5.0.0] - 2020-06-23

commit: [#](https://github.com/kalm/kalm.js/commit/527a245e4855f6ab7678ef4fe1ee9e7cd2ff3cb8)

### Breaking changes
- Changed default packet framing to be a pure json object
- Removed custom framing
- Added packet message cap
- Fixed multiplexing

### Added
- Added more error messages
- Added tests for transport packages
- Added CHANGELOG and LICENSE to all packages

## [v4.0.0] - 2020-03-28

commit: [731491d](https://github.com/kalm/kalm.js/commit/731491d7b98f3116e0491905c99f9ece29d24d65)

### Added
- Added more error messages
- Added tests for transport packages
- Added CHANGELOG and LICENSE to all packages
- Added 'framing' option to set packet framing to be a pure json object


## [v3.3.0] - 2020-01-30

commit: [af46059](https://github.com/kalm/kalm.js/commit/af4605958c567b5243887f911850a3c0eb6c6659)

### Added
- Added webrtc package and examples
- Added the getChannels method on Client

### Removed
- Removed home implementation of EventEmitter in favor of Node's

## [v3.2.3] - 2020-01-14

commit: [c188225](https://github.com/kalm/kalm.js/commit/c18822532a49f2026eddf44cfbe3cfc1521110f8)

### Added
- Added pre-hook for lint on commit

### Changed
- Cleaned up Types management and typings file accessibility
- Migrated test suite to Jest and centralized test tooling
- Removed output rollup, and using only tsc with none modules
- Fixed linting (was not targeting .ts files properly)
- Fixed stats events (were previously unreachable, now exposed through client emitter as .*)
- Fixed timeout behavior (only logged, now actually disconnects)

## [v3.1.2] - 2019-07-01

commit: [fac8047](https://github.com/kalm/kalm.js/commit/fac8047d4b7048d56803505103159e16d8f518a8)

### Changed
- Changed dev tooling from lerna to yarn workspaces
- Changed dev tooling from tslint to eslint + @typescript-eslint
- Housekeeping

## [v3.0.0] - 2019-01-18

commit: [a4c687d](https://github.com/kalm/kalm.js/commit/a4c687dd5786a70723d9d0964a9d189220d58418)

### Added
- New monorepo structure
- Massive new changes to the interface

### Changed
- Serialization is now a toggle for json/binary
- Re-written the entire codebase in Typescript

### Removed
- Transports are no longer bundled and must be installed separately and must be instantiated with options.
  - [ipc](https://www.npmjs.com/package/@kalm/ipc)
  - [tcp](https://www.npmjs.com/package/@kalm/tcp)
  - [udp](https://www.npmjs.com/package/@kalm/udp)
  - [ws](https://www.npmjs.com/package/@kalm/ws)
- Profiles become routines and must be instantiated with options.
- No more session stores
- No more encryption

## [v2.6.1] - 2018-01-27

commit: [7393d17](https://github.com/kalm/kalm.js/commit/7393d17efb02088d7283ba83108fd7ab15e3d39e)

### Added
- Added package-lock.json file
- Added server reference in the client object

## [v2.5.0] - 2017-09-21

commit: [2c687f6](https://github.com/kalm/kalm.js/commit/2c687f6074787af6b39c10abe19669fe20e7b02d)

### Added
- Added engines reqs

### Changed
- Some minor performance tuning

## [v2.4.0] - 2017-09-01

commit: [a7b8f95](https://github.com/kalm/kalm.js/commit/a7b8f950da56cbe35c538dc02e3dcc0e6d3a3db3)

### Changed
- Tuned performances
- Added build targets for Node 8.x and 6.x
- UDP client cache (tied with socketTimeout)
- Bumped dependencies
- Proper callback on disconnect

### Removed
- Dropped support for Node 4.x

## [v2.3.0] - 2017-07-25

commit: [f323bcd](https://github.com/kalm/kalm.js/commit/f323bcdc163faa40b0f8515fd4a8759e5180f516)

### Added
- Added realtime profile
- Added JSDoc
- Added parameter validation and error messages

### Changed
- Better performances (3x with default congestion)

## [v2.2.0] - 2017-06-21

commit: [b9f3bdd](https://github.com/kalm/kalm.js/commit/b9f3bdd50de8dae2b92a0866d234a0cb2e72f22b)

### Added
- Added support for node 8

## [v2.1.0] - 2017-06-20

commit: [129146f](https://github.com/kalm/kalm.js/commit/129146feeab14e94a540a4d9c54e05a4614fdb39)

### Changed
- Simplified and optimized queue system logic
- Now allowing 0 to be passed as tick value in profiles
- Added warning when non-serialized message are sent and serial config is `null`
- Fixed hanging packets on maxBytes just reached

## [v2.0.0] - 2017-03-02

commit: [b5209ec](https://github.com/kalm/kalm.js/commit/b5209ec4d3ab86000b72b502d120f0a5b4da85af)

### Added
- Migrated the codebase from the [original repo](https://github.com/fed135/kalm)
- Implemeted new interface
