Use this shorter handoff/status version:

```md
# B-hyve FP Status

## Goal

Build a TypeScript B-hyve library while learning FP step by step.

Current focus:

- pure vs effectful boundaries
- explicit error handling with `Either`
- dependency injection for HTTP calls

## Completed

- Set up TS project in `src/`
- Switched project to ESM-style imports
- Added `.gitignore` for generated TS output
- Created domain types in `src/types.ts`
  - `Credentials`
  - `AuthSession`
- Created login transport types in `src/login.ts`
  - `LoginRequest`
  - `RawLoginResponse`
  - `LoginError`
  - `SendLoginRequest`
- Added pure login helpers in `src/login.ts`
  - `buildLoginRequest`
  - `toAuthSession`
- Added local `Either` implementation in `src/either.ts`
  - `Left`
  - `Right`
  - `Either`
  - `left`
  - `right`
  - `matchEither`
- Implemented `login(sendLoginRequest, credentials)` returning:
  - `Promise<Either<LoginError, AuthSession>>`
- Added `src/example.ts` showing:
  - fake `sendLoginRequest`
  - call to `login(...)`
  - consumption via `matchEither(...)`

## Current State

Files and roles:

- `src/types.ts`
  - domain types only
- `src/login.ts`
  - login transport types
  - login orchestration
  - login mapping logic
- `src/either.ts`
  - local `Either` abstraction
- `src/example.ts`
  - demo/composition file
- `docs/bhyve-api-research.md`
  - local API research

Current `login(...)` shape:

- injected dependency: `SendLoginRequest`
- input: `Credentials`
- output: `Promise<Either<LoginError, AuthSession>>`

Current example is still fake:
- fake request returns a fake token
- no real HTTP yet

## Important Design Decisions

- Keep domain types separate from API transport types
- Keep pure transformations separate from effectful HTTP calls
- Use local `Either` first before introducing `fp-ts` / `TaskEither`
- `example.ts` is only the composition/demo point, not the long-term home for real HTTP

## Current Step

Move from fake login request to real HTTP login request.

We now have local research in:

- `docs/bhyve-api-research.md`

Confirmed login endpoint from research:

- `POST https://api.orbitbhyve.com/v1/session`

Observed request body:

```json
{
  "session": {
    "email": "user@example.com",
    "password": "secret"
  }
}
```

Observed token fields may vary:

- `orbit_session_token`
- `orbit_api_key`

`user_id` may also be present.

## Immediate Next Steps

- Widen `RawLoginResponse` to support:
  - `orbit_session_token?`
  - `orbit_api_key?`
  - `user_id?`
- Update `toAuthSession(...)` to accept either token field
- Create real HTTP implementation of `SendLoginRequest`
  - likely in `src/bhyve-api.ts`
- Keep `login(...)` as orchestrator
- Rewire `src/example.ts` to use the real request function instead of the fake one

## Short-Term Followups

- Improve `LoginError` mapping
  - distinguish network failure
  - distinguish invalid credentials
  - distinguish unexpected response shape
- After real login works, move to authenticated device fetch
- Consider `TaskEither` later, not now

## Notes For Next Agent

- Keep tutorial/paired-learning style
- Prefer small explicit steps
- Do not jump ahead into full library scaffolding
- Do not introduce `fp-ts` yet unless the user explicitly wants it
- Real next milestone is successful live login, not broader API coverage
```

If you want, I can also compress that one more level into a very terse “agent briefing” version.
