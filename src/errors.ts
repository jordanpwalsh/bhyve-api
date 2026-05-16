export class InvalidCredentialsError extends Error {
  constructor() {
    super("invalid credentials");
    this.name = "InvalidCredentialsError"
  }
}

export class HttpLoginError extends Error {
  constructor(public readonly status: number) {
    super(`login failed with status ${status}`)
    this.name = "HttpLoginError";
  }
}


