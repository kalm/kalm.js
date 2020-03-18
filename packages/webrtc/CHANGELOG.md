# Changelog

## [v3.3.0] - 2020-01-30

commit: [af46059](https://github.com/kalm/kalm.js/commit/af4605958c567b5243887f911850a3c0eb6c6659)

### Added
- Adds webrtc package and examples
- Adds the getChannels method on Client

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
