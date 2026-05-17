import type {LoginRequest, RawLoginResponse, SendLoginRequest} from "./login.js"
import {InvalidCredentialsError, HttpLoginError} from "./errors.js"
import type { AuthSession } from "./types.js";


export type HttpRequest = (
  path: string,
  options?: {method?: string, body?: unknown}
) => Promise<unknown>;

export const createRequest = (session: AuthSession): HttpRequest => {
  return async (path, options = {}) => {
    const headers: Record<string, string> = {
      "orbit-api-key": session.token,
      "Orbit-Session-Token": session.token,
      "orbit-app-id": "Bhyve Dashboard",
    };

    if (options.body) {
      headers['Content-Type'] = 'application/json; charset=UTF-8';
    }

    const response = await fetch(`https://api.orbitbhyve.com${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : null
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  };
} 

export const sendLoginRequest: SendLoginRequest = async (
  request: LoginRequest,
): Promise<RawLoginResponse> => {
  const response = await fetch("https://api.orbitbhyve.com/v1/session", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
      Origin: "https://techsupport.orbitbhyve.com",
      Referer: "https://techsupport.orbitbhyve.com",
      "orbit-app-id": "Bhyve Dashboard"
    },
    body: JSON.stringify(request)
  });

  if (response.status === 401 || response.status === 403) {
    throw new InvalidCredentialsError();
  }

  if (!response.ok) {
    throw new HttpLoginError(response.status)
  }

  return await response.json();
}
