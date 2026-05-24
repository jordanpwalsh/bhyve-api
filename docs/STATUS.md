# B-hyve FP Status

## Goal

Build a TypeScript B-hyve library while learning functional programming step by step.

Current focus:

- pure vs effectful boundaries
- explicit error handling with `Either`
- dependency injection for HTTP calls
- mapping raw B-hyve API data into domain values

## Completed

- Set up TypeScript project with ESM imports
- Added `npm run check` and `npm test`
- Added local `Either` implementation in `src/either.ts`
- Added login domain and transport modeling
- Implemented `login(sendLoginRequest, credentials)`
  - returns `Promise<Either<LoginError, AuthSession>>`
- Added real login HTTP boundary in `src/bhyve-api.ts`
- Added authenticated request builder with `createRequest(session)`
- Added device and zone modeling in `src/devices.ts`
- Added pure mappers:
  - `rawToZone`
  - `rawToDevice`
  - `rawDevicesToDevices`
- Added `getDevices(sendDevicesRequest)`
  - keeps HTTP injected
  - maps raw response into `Device[]`
- Added unit tests for device mapping and injected device fetching

## Current State

The repo is green:

- `npm run check` passes
- `npm test` passes
- 6 tests pass

Current main files:

- `src/types.ts`
  - shared domain types: `Credentials`, `AuthSession`
- `src/either.ts`
  - local `Either` abstraction
- `src/login.ts`
  - login request/response modeling
  - login orchestration
  - login error mapping
- `src/bhyve-api.ts`
  - real HTTP functions
  - effectful API boundary
- `src/devices.ts`
  - device/zone types
  - pure raw-to-domain mapping
  - injected device fetch orchestration
- `src/devices.test.ts`
  - current active learning/test file

## Important Design Decisions

- Keep pure transformations separate from HTTP calls
- Inject effectful dependencies instead of hiding them inside domain logic
- Use local `Either` before introducing libraries like `fp-ts`
- Keep API response shapes distinct from nicer library/domain shapes
- Let tests drive small mapping behavior

## Current FP Lesson

The project now has the pattern:

1. effectful edge gets raw API data
2. pure function maps raw data into domain data
3. orchestration function connects the two

For devices:

- `SendDevicesRequest` is the effectful dependency
- `rawDevicesToDevices(...)` is pure
- `getDevices(...)` composes them

## Immediate Next Steps

- Clean up tiny noise in `src/devices.test.ts`
  - remove commented duplicate call
  - remove extra trailing whitespace
- Decide how device fetch errors should work:
  - keep `getDevices(...)` as `Promise<Device[]>` for now
  - or evolve it toward `Promise<Either<DeviceError, Device[]>>`
- Add tests for malformed or partial device/zone data
- Consider whether raw validation should stay permissive or become stricter
- After that, add the next authenticated endpoint only when this pattern feels solid