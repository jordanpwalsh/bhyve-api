import type { AuthSession, Credentials } from "./types.js";
import { left, right, type Either } from "./either.js"; 
import { HttpLoginError, InvalidCredentialsError } from "./errors.js";

export type LoginRequest = {
  session: {
    email: string,
    password: string,
  };
}

export type RawLoginResponse = {
  orbit_session_token?: string;
  orbit_api_key?: string;
  user_id?: string;
}

export type LoginError =
  | {type: "NetworkError"; message: string }
  | {type: "InvalidCredentials"}
  | {type: "UnexpectedResponse"; message: string}

export type SendLoginRequest = (
  request: LoginRequest,
) => Promise<RawLoginResponse>;

export const buildLoginRequest = (credentials: Credentials): LoginRequest => {
  return {
    session: {
      email: credentials.email,
      password: credentials.password
    }
  }
}

export const login = async (
  sendLoginRequest: SendLoginRequest, 
  credentials: Credentials
): Promise<Either<LoginError, AuthSession>> => {
  try {
    const loginRequest = buildLoginRequest(credentials)
    const resp = await sendLoginRequest(loginRequest)
    const session = toAuthSession(resp)
    return right(session)
  } catch(error) {
    if (error instanceof InvalidCredentialsError) {
      return left({ type: "InvalidCredentials"})
    }

    if (error instanceof HttpLoginError) {
      return left({
        type: "NetworkError", 
        message: "login request failed",
      })
    }

    if (error instanceof Error && error.message === "login response did not include a token") {
      return left({
        type: "UnexpectedResponse",
        message: error.message
      })
    }

    return left({
      type: "NetworkError",
      message: "login request failed"
    })
  }
}

export const toAuthSession = (raw: RawLoginResponse): AuthSession => {
  const token = raw.orbit_session_token ?? raw.orbit_api_key
  if (!token) {
    throw new Error("login response did not include a token");
  }

  return {
    token
  }
}


