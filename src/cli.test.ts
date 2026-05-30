import test from "node:test"
import assert from "node:assert/strict"

import {credentialsFromEnv, renderCliError } from "./cli.js"

test("credentialsFromEnv returns credentials when email and password exist", () => { 
  const result = credentialsFromEnv({
    BHYVE_EMAIL: "user@example.com",
    BHYVE_PASSWORD: "secret",
  })

  assert.deepEqual(result, {
    type: "Right",
    value: {
      email: "user@example.com",
      password: "secret",
    },
  })
})

test("credentialsFromEnv returns MissingCredentials when email is missing", () => {
  const result = credentialsFromEnv({
    BHYVE_PASSWORD: "secret",
  })

  assert.deepEqual(result, {
    type: "Left",
    value: {
      type: "MissingCredentials"
    }
  })
})

test("credentialsFromEnv returns MissingCredentials when password is missing", () => {
  const result = credentialsFromEnv({
    BHYVE_EMAIL: "user@example.com",
  })

  assert.deepEqual(result, {
    type: "Left",
    value: {
      type: "MissingCredentials"
    }
  })
})

test("renderCliError renders missing credentials", () => {
  assert.equal(
    renderCliError({type: "MissingCredentials"}),
    "Missing credentials. Set BHYVE_EMAIL and BHYVE_PASSWORD."
  )
})

test("renderCliError renders unknown commands", () => {
  assert.equal(
    renderCliError({type: "UnknownCommand", command: "water"}),
    "Unknown command: water"
  )
})
