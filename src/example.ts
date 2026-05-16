import {matchEither} from "./either.js"
import {login } from "./login.js"
import type { Credentials } from "./types.js"
import { sendLoginRequest } from './bhyve-api.js'


const email = process.env.BHYVE_EMAIL;
const password = process.env.BHYVE_PASSWORD;

if (!email || !password) {
  throw new Error("Environment variables BHYVE_EMAIL and BHYVE_PASSWORD must be set");
}

const credentials: Credentials = {
  email: email,
  password: password
};

const result = await login(sendLoginRequest, credentials)

const message = matchEither(
  result,
  (error) => `login failed: ${error.type}`,
  (session) => `login succeeded: ${session.token}`
);

console.log(`Message is: ${message}`)
