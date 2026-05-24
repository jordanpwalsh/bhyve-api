# B-hyve FP Handoff

## Context

This project is a new TypeScript library for working with Orbit B-hyve sprinklers.

The user is building it as a functional-programming learning exercise, not just trying to get a library scaffolded quickly. The work should stay tutorial-like, deliberate, and small-step.

## User Goal

Build a JS/TS B-hyve library in a functional style.

The user wants:

- a step-by-step learning experience
- functional-programming guidance instead of “agent writes everything”
- small explicit steps
- explanations of why each decision exists
- help reasoning about boundaries, purity, and modeling

## Important Style Constraints

- Do not jump ahead and scaffold a full architecture unless the user asks.
- Do not create many files preemptively.
- Prefer tiny steps over large implementations.
- Explain concepts in beginner-friendly FP terms.
- Treat this like paired learning, not code generation.
- In this repo specifically, prefer tutoring and review over directly editing files.

## Current Project State

The project now includes login, authenticated request construction, and the first device-fetching workflow.

Current files include:

- `src/types.ts`
- `src/either.ts`
- `src/login.ts`
- `src/bhyve-api.ts`
- `src/devices.ts`
- `src/devices.test.ts`
- `src/example.ts`

TypeScript and tests currently pass with:

- `npm run check`
- `npm test`

## Current Code Structure

### `src/types.ts`

This now contains only domain types:

- `Credentials`
- `AuthSession`

Current intent:

- `Credentials` is the app/library input for login
- `AuthSession` is the app/library representation of a successful authenticated session

### `src/login.ts`

This now contains login-specific transport types and pure login transformations:

- `LoginRequest`
- `RawLoginResponse`
- `buildLoginRequest`
- `toAuthSession`

Current intent:

- `LoginRequest` models the API request shape
- `RawLoginResponse` models the API response shape
- `buildLoginRequest` maps `Credentials -> LoginRequest`
- `toAuthSession` maps `RawLoginResponse -> AuthSession`

This boundary is important and was a deliberate design step.

## Functional Programming Progress So Far

We have already established the first useful FP boundary:

- domain values
- transport values
- pure transformations between them

That is the current “pure core”:

1. `Credentials -> LoginRequest`
2. `RawLoginResponse -> AuthSession`

These functions are intentionally tiny and pure.

This is the main concept learned so far:

- keep transformation logic pure
- isolate API-specific shapes at the boundary
- avoid mixing domain concepts with raw transport concepts

## Configuration Decisions Already Made

### Module System

The project was switched to ESM.

`package.json` now uses:

- `"type": "module"`

This was done because:

- the source is written with `import` / `export`
- `tsconfig.json` uses `module: "nodenext"`
- for a new TS library, ESM is the better default here

### Import Style

Because the project uses ESM with `nodenext`, relative imports in TypeScript use explicit `.js` extensions, for example:

- `./types.js`

This was surprising to the user at first, because some bundler-based JS projects do not require that. We discussed that this is expected in raw Node ESM resolution.

### Git Ignore

A `.gitignore` was added to avoid generated TS output clutter.

It currently ignores:

- `node_modules/`
- `dist/`
- `*.js`
- `*.js.map`
- `*.d.ts`
- `*.d.ts.map`
- `.DS_Store`

## Teaching / Design Decisions Made

We discussed and refined the early file boundaries.

### Earlier State

Initially all types were together in `src/types.ts`.

That was acceptable as a first learning step.

### Current State

We then improved the structure by moving login-specific transport types into `src/login.ts`.

This means the current conceptual split is:

- `src/types.ts`:
  - domain types
- `src/login.ts`:
  - login transport types
  - login mapping logic

This is a better fit than keeping `toAuthSession` in `types.ts`, because the user correctly pointed out that it belongs with login behavior.

## Important User Insight

The user objected to moving `toAuthSession` into `types.ts`, saying that it felt login-related rather than type-definition-related.

That instinct was good.

The refined recommendation became:

- keep `toAuthSession` in `login.ts`
- keep `buildLoginRequest` in `login.ts`
- keep login transport types in `login.ts`
- keep domain types in `types.ts`

This is the current preferred structure.

## Current Recommendation

The project has now moved into devices, but in a good small-step way.

Stay focused on the same FP pattern:

1. model raw API data
2. map raw data with pure functions
3. inject the effectful HTTP request
4. test the pure mapping and orchestration separately

Do not broaden into programs, watering commands, websockets, or full client architecture yet.

## Best Next Step

Use `src/devices.test.ts` as the current learning surface.

Recommended next discussion:

1. Should `getDevices(...)` return plain `Promise<Device[]>`?
2. Or should it mirror login and return `Promise<Either<DeviceError, Device[]>>`?
3. What kinds of device API failures are worth modeling explicitly?
4. Which raw response cases should get defaults, and which should become errors?

This keeps the next lesson centered on FP error modeling without jumping to a bigger library design.


## Suggested Near-Term Direction

A reasonable next conceptual step is to discuss a future function like:

- `login(credentials): Promise<AuthSession>`

without fully implementing networking yet.

That keeps the learning sequence small:

1. model data
2. write pure transforms
3. identify the effectful boundary
4. only then add I/O

## Guidance For The Next Agent

Please continue in a collaborative tutorial style.

Good approach:

- explain one concept at a time
- keep examples tied to B-hyve
- prefer “why this boundary exists” over abstract theory
- keep the user moving with small wins
- review their edits carefully instead of taking over

Avoid:

- generating a full package skeleton immediately
- introducing many files at once
- turning the session into a long lecture
- jumping to advanced FP libraries too early
- overriding the repo’s tutorial-first instruction style

## Verification Status

As of this handoff:

- `src/types.ts` contains domain types only
- `src/login.ts` contains login transport types and two pure functions
- TypeScript compiles successfully with `tsc --noEmit`

## Assumption

This handoff assumes the current working folder is the intended project root:

- `/Users/jordan/devel/personal/bhyve-api`
