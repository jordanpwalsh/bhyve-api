import {matchEither} from "./either.js"
import {login } from "./login.js"
import type { Credentials } from "./types.js"
import { createRequest, sendLoginRequest } from './bhyve-api.js'
import { getDevices, type SendDevicesRequest, type RawDeviceResponse } from "./devices.js";


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

const message = await matchEither(
  result,
  (error) => Promise.resolve(`login failed: ${error.type}`),
    async (session) => {
    const request = createRequest(session)

    const sendDevicesRequest: SendDevicesRequest = async () => {
      return await request("/v1/devices") as RawDeviceResponse
    }

    const devices = await getDevices(sendDevicesRequest)
    getDevices(sendDevicesRequest)

    return `login succeeded: ${session.token}, found ${devices.length} devices`
  }
);

console.log(`Message is: ${message}`)
