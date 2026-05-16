import {matchEither} from "./either.js"
import {login } from "./login.js"
import type { LoginRequest, RawLoginResponse } from "./login.js"
import type { Credentials } from "./types.js"

const sendLoginRequest = async (request: LoginRequest): Promise<RawLoginResponse> => {
  return {
    orbit_session_token: "fake-token"
  };
};

const credentials: Credentials = {
  email: "test@example.com",
  password: "secret"
};

const result = await login(sendLoginRequest, credentials)

const message = matchEither(
  result,
  (error) => `login failed: ${error.type}`,
  (session) => `login succeeded: ${session.token}`
);

console.log(`Message is: ${message}`)
