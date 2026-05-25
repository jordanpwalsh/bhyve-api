import { left, matchEither, right, type Either } from "./either.js"
import { createRequest, sendLoginRequest } from "./bhyve-api.js"
import { type Credentials } from "./types.js";


export type CliError =
  | { type: "MissingCredentials" }
  | { type: "LoginFailed"; message: string }
  | { type: "DeviceFetchFailed"; message: string }
  | { type: "DeviceFetchParseFailed"; message: string }
  | { type: "UnknownCommand", command: string }

export const credentialsFromEnv = (
  env: NodeJS.ProcessEnv
): Either<CliError, Credentials> => {
  const email = env.BHYVE_EMAIL
  const password = env.BHYVE_PASSWORD

  if (!email || !password) {
    return left({ type: "MissingCredentials" })
  }

  return right({ email, password })
}