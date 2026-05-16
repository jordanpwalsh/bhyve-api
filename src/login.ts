import type { AuthSession, Credentials } from "./types.js";
import { left, right, type Either } from "./either.js"; 

export type LoginRequest = {
  session: {
    email: string,
    password: string,
  };
}

export type RawLoginResponse = {
  orbit_session_token: string;
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
  } catch {
      return left({
        type: "NetworkError", 
        message: "login request failed",
      })
  }

}

export const toAuthSession = (raw: RawLoginResponse): AuthSession => {
  return {
    token: raw.orbit_session_token,
  }
}


