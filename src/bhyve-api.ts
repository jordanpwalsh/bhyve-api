import type {LoginRequest, RawLoginResponse, SendLoginRequest} from "./login.js"
import {InvalidCredentialsError, HttpLoginError} from "./errors.js"


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
