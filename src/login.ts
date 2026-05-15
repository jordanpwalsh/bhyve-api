import type { AuthSession, Credentials } from "./types.js";

export type LoginRequest = {
  session: {
    email: string,
    password: string,
  };
}

export type RawLoginResponse = {
  orbit_session_token: string;
}


export const buildLoginRequest = (credentials: Credentials): LoginRequest => {
  return {
    session: {
      email: credentials.email,
      password: credentials.password
    }
  }
}

export const toAuthSession = (raw: RawLoginResponse): AuthSession => {
  return {
    token: raw.orbit_session_token,
  }
}


