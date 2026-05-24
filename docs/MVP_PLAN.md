# MVP Plan

## Goal

Build a workable TypeScript B-hyve MVP while learning functional programming through small, concrete steps.

The MVP should provide:

- a basic CLI entry point
- login using B-hyve credentials
- authenticated device fetching
- readable output showing devices and zones
- explicit error handling without uncaught application-level failures

This is still a learning project, so the MVP is not "full API coverage." The goal is one useful vertical slice.

## Current Baseline

Already implemented:

- local `Either` type
- login request mapping
- login orchestration returning `Promise<Either<LoginError, AuthSession>>`
- real B-hyve login HTTP request
- authenticated HTTP request helper
- raw device and zone mapping
- device fetching returning `Promise<Either<DeviceError, Device[]>>`
- unit tests for device mapping and device request failure
- `src/example.ts` demonstrating login followed by device fetch

Current FP lessons already covered:

- pure transformations
- effectful boundaries
- dependency injection
- explicit success/failure values with `Either`
- avoiding hidden HTTP inside pure mapping code

## MVP Shape

The MVP CLI should support one initial command:

```sh
bhyve devices
```

Expected behavior:

1. Read credentials from environment variables.
2. Log in to B-hyve.
3. Fetch devices.
4. Print a simple list of devices and zones.
5. Print useful error messages for login or device failures.

Initial credential source:

```sh
BHYVE_EMAIL=user@example.com
BHYVE_PASSWORD=secret
```

No config files, token storage, prompts, or OAuth-style flows for the MVP.

## Lesson 1: Clean Composition

Before adding a CLI, make the current example flow feel clean.

Learning goal:

- understand how to compose multiple fallible async steps

Current shape:

```ts
login(...) -> Promise<Either<LoginError, AuthSession>>
getDevices(...) -> Promise<Either<DeviceError, Device[]>>
```

Questions to answer:

- when is nested `matchEither` acceptable?
- when should we extract helper functions?
- when would `chain` / `flatMap` become useful?

MVP task:

- keep `src/example.ts` as a clear composition example
- avoid broad abstractions until the repetition becomes painful

Done when:

- `npm run check` passes
- `npm test` passes
- the example reads clearly from top to bottom

## Lesson 2: Separate CLI From Library Logic

Create a CLI surface without mixing it into domain logic.

Learning goal:

- keep command-line concerns at the outer edge

CLI concerns:

- reading `process.argv`
- reading `process.env`
- printing output
- choosing exit codes

Library concerns:

- login
- request creation
- device fetching
- raw-to-domain mapping
- error modeling

Suggested files eventually:

- `src/cli.ts`
  - command-line entry point
- existing library modules stay focused:
  - `login.ts`
  - `devices.ts`
  - `bhyve-api.ts`
  - `either.ts`
  - `types.ts`

Done when:

- running the CLI can fetch devices
- domain modules do not know about `process.argv`
- domain modules do not print to the console

## Lesson 3: Model CLI Errors

Add a small CLI-level error type if needed.

Learning goal:

- understand that each boundary may have its own error language

Possible CLI errors:

```ts
type CliError =
  | { type: "MissingCredentials" }
  | { type: "LoginFailed"; message: string }
  | { type: "DeviceFetchFailed"; message: string }
  | { type: "UnknownCommand"; command: string }
```

Important idea:

- `LoginError` belongs to login
- `DeviceError` belongs to devices
- `CliError` belongs to the command-line program

The CLI can translate lower-level errors into user-facing messages.

Done when:

- missing credentials do not throw raw errors
- unknown commands print a helpful message
- login and device failures print clear messages

## Lesson 4: Render Domain Values

Add pure rendering functions for CLI output.

Learning goal:

- formatting text can be pure too

Example function shapes:

```ts
renderDevices(devices: Device[]): string
renderDevice(device: Device): string
renderZone(zone: Zone): string
```

These should not call `console.log`.

They should return strings.

The CLI can call:

```ts
console.log(renderDevices(devices))
```

Done when:

- device rendering is tested without making HTTP calls
- output includes device name, type, and zones
- formatting logic is separate from fetching logic

## Lesson 5: Add Minimal CLI Wiring

Add a package script first.

Possible script:

```json
{
  "scripts": {
    "cli": "tsx src/cli.ts",
    "check": "tsc --noEmit",
    "test": "node --import tsx --test src/**/*.test.ts"
  }
}
```

Use it like:

```sh
npm run cli -- devices
```

Later, after the MVP works, consider adding a real `bin` entry.

Done when:

- `npm run cli -- devices` works
- `npm run check` passes
- `npm test` passes

## Lesson 6: Improve HTTP Error Boundaries

The current HTTP layer is good enough for learning, but the MVP should make failures clearer.

Learning goal:

- distinguish transport failures from domain mapping failures

Possible improvements:

- preserve HTTP status in HTTP-specific errors
- distinguish unauthorized login from general network failure
- decide whether malformed device responses should default or fail
- avoid throwing generic `Error` from reusable library paths where practical

Do not overbuild this before the CLI works.

Done when:

- invalid credentials produce a clear CLI message
- device request failures produce a clear CLI message
- unexpected response shapes have an intentional behavior

## Lesson 7: Decide Whether To Introduce `chain`

After login plus device fetch plus CLI error translation, the project may start to show repeated `matchEither`.

Learning goal:

- understand the motivation for `chain` from real discomfort

Only introduce a helper if the code asks for it.

Possible helper:

```ts
chainEither(...)
```

Or later:

```ts
TaskEither
```

Do not introduce `fp-ts` for the MVP unless explicitly desired.

Done when:

- the user understands why nested `matchEither` appears
- the user can explain what `chain` would remove
- the code remains readable without jumping too far ahead

## MVP Completion Criteria

The MVP is complete when:

- `npm run check` passes
- `npm test` passes
- `npm run cli -- devices` logs in and prints devices
- missing credentials produce a friendly message
- invalid login produces a friendly message
- device request failure produces a friendly message
- device and zone output is readable
- core transformations remain pure and tested

## Not In MVP

These are intentionally out of scope:

- watering commands
- schedules/programs
- websocket support
- token persistence
- config files
- packaging and publishing
- full API coverage
- advanced FP libraries
- retries
- logging framework

## Recommended Next Step

Start by extracting the successful example flow into a CLI-shaped function without adding command parsing yet.

A good next learning target:

```ts
runDevicesCommand(): Promise<Either<CliError, string>>
```

That keeps the CLI output as a value first.

Then the outermost CLI edge can decide:

- print success string
- print error string
- set process exit code
