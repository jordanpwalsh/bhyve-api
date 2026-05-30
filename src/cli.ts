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

export const renderCliError = (error: CliError): string => {
  switch(error.type) {
    case "MissingCredentials":
      return "Missing credentials. Set BHYVE_EMAIL and BHYVE_PASSWORD."
    case "LoginFailed":
      return "Login failed"
    case "DeviceFetchFailed": 
      return `Device fetch failed: ${error.message}`
    case "DeviceFetchParseFailed": 
      return `Device respinse was invalid: ${error.message}`
    case "UnknownCommand":
      return `Unknown command: ${error.command}`
  }
}


