# Orbit B-hyve API Research

Last researched: May 15, 2026

## Summary

Orbit B-hyve does not appear to publish a public developer API for sprinkler control. The practical integration path is an unofficial cloud API used by community projects. The current evidence points to:

- REST calls to `https://api.orbitbhyve.com`
- A WebSocket event stream at `wss://api.orbitbhyve.com/v1/events`
- Login with email/password
- Device/program metadata over REST
- Manual control and live events over WebSocket

This doc is based on:

- Official B-hyve support pages that confirm app capabilities like manual watering, rain delay, and smart watering
- A maintained Home Assistant integration that includes a Python client and WebSocket transport
- Two Node/community integrations that show compatible payloads

## Key Caveat

This is an unofficial API. We should design the JS library defensively:

- expect schema drift
- expect undocumented event changes
- accept multiple token field names from login
- keep logging and raw payload inspection easy
- avoid promising full support for every B-hyve device on day one

## Confirmed Connection Flow

### 1. Login

`POST /v1/session`

Observed request body:

```json
{
  "session": {
    "email": "user@example.com",
    "password": "secret"
  }
}
```

Observed headers in community clients:

- `Accept: application/json`
- `Content-Type: application/json; charset=UTF-8`
- `Origin: https://techsupport.orbitbhyve.com`
- `Referer: https://techsupport.orbitbhyve.com/`
- `User-Agent: browser-like UA`
- `orbit-app-id: Bhyve Dashboard` or `Orbit Support Dashboard`
- `orbit-api-key: null`

Observed response fields differ by client:

- Home Assistant Python client stores `response["orbit_api_key"]`
- The newer `bhyve-api` Node client stores `response.data.orbit_session_token`
- Older Node code also reads `user_id`

Design note:

- Our JS library should accept either `orbit_api_key` or `orbit_session_token`
- We should also preserve `user_id` if present

### 2. REST-authenticated requests

Observed authenticated headers:

- `orbit-api-key: <token>`
- `Orbit-Session-Token: <token>` or `orbit-session-token: <token>`
- `orbit-app-id: Bhyve Dashboard`

Community code is inconsistent about which token header is canonical, so the safest initial strategy is:

- send `orbit-api-key`
- also send `Orbit-Session-Token`
- optionally allow caller override for header strategy

### 3. WebSocket connection

Connect to:

`wss://api.orbitbhyve.com/v1/events`

Observed initial auth message:

```json
{
  "event": "app_connection",
  "orbit_session_token": "<token>"
}
```

Older code also includes an optional device subscription:

```json
{
  "event": "app_connection",
  "orbit_session_token": "<token>",
  "subscribe_device_id": "<device-id>"
}
```

Observed keepalive:

```json
{ "event": "ping" }
```

Typical cadence in community clients is about every 25 seconds.

## Confirmed REST Surface

The maintained Python client currently uses these endpoints:

### `POST /v1/session`

Purpose:

- authenticate
- obtain token
- often obtain `user_id`

### `GET /v1/devices`

Purpose:

- list devices associated with the account

Observed usage:

- current Home Assistant client calls `/v1/devices?t=<timestamp>`
- older Node code references device lookup tied to account user context
- newer Node code calls `/v1/devices?user_id=<user_id>`

Design note:

- implement device listing with optional query params so we can adapt if the server expects `user_id` for some accounts

### `GET /v1/sprinkler_timer_programs`

Purpose:

- fetch watering programs for sprinkler timers

Observed usage:

- `/v1/sprinkler_timer_programs?t=<timestamp>`

### `PUT /v1/sprinkler_timer_programs/{programId}`

Purpose:

- enable/disable a non-smart program
- update program configuration

Observed payload wrapper:

```json
{
  "sprinkler_timer_program": {
    "...": "program fields"
  }
}
```

Confirmed update fields used by Home Assistant:

- `enabled`
- `budget`
- `frequency`
- `start_times`
- `run_times`
- `name`
- `program`
- `program_start_date`
- `device_id`
- `id`

### `GET /v1/watering_events/{deviceId}`

Purpose:

- fetch recent watering history

Observed usage:

- `/v1/watering_events/{deviceId}?page=1&per-page=10&t=<timestamp>`

### `GET /v1/landscape_descriptions/{deviceId}`

Purpose:

- fetch zone landscape/smart-watering metadata for a device

Used for:

- smart watering details
- zone image URL
- sprinkler type
- soil moisture calculations

### `PUT /v1/landscape_descriptions/{landscapeId}`

Purpose:

- update a zone landscape
- currently used by Home Assistant to set smart-watering soil moisture

Observed payload wrapper:

```json
{
  "landscape_description": {
    "...": "landscape fields"
  }
}
```

### `PUT /v1/devices/{deviceId}`

Purpose:

- update device settings
- currently used by Home Assistant to toggle `smart_watering_enabled` on zones

Observed payload wrapper:

```json
{
  "device": {
    "...": "device fields"
  }
}
```

## Confirmed WebSocket Actions

### Manual zone watering

Observed payload:

```json
{
  "event": "change_mode",
  "mode": "manual",
  "device_id": "<device-id>",
  "timestamp": "2026-05-15T12:34:56Z",
  "stations": [
    {
      "station": 1,
      "run_time": 15
    }
  ]
}
```

Notes:

- `run_time` appears to be in minutes in current community clients
- an empty `stations` array is used to stop manual watering
- the official app supports queueing multiple zones for manual watering, so a future JS API should probably allow `stations[]`, not only one station

### Stop manual watering

Observed payload:

```json
{
  "event": "change_mode",
  "mode": "manual",
  "device_id": "<device-id>",
  "timestamp": "2026-05-15T12:34:56Z",
  "stations": []
}
```

### Start a program manually

Observed payload:

```json
{
  "event": "change_mode",
  "mode": "manual",
  "device_id": "<device-id>",
  "timestamp": "2026-05-15T12:34:56Z",
  "program": "<program-payload>"
}
```

The Home Assistant integration sends the program identifier/payload already present in the program object it fetched from REST.

### Set rain delay

Observed payload:

```json
{
  "event": "rain_delay",
  "device_id": "<device-id>",
  "delay": 24
}
```

Notes:

- `delay` is in hours
- `0` disables rain delay
- official app documentation says rain delay can be set for up to 32 days

### Set manual preset runtime

Observed payload:

```json
{
  "event": "set_manual_preset_runtime",
  "device_id": "<device-id>",
  "seconds": 900
}
```

Notes:

- Home Assistant exposes this as minutes, then converts to seconds
- this appears to set the default device-level manual watering duration

### Change device mode

Older Node code shows additional valid mode changes:

```json
{
  "event": "change_mode",
  "mode": "auto",
  "device_id": "<device-id>",
  "timestamp": "2026-05-15T12:34:56Z"
}
```

```json
{
  "event": "change_mode",
  "mode": "off",
  "device_id": "<device-id>",
  "timestamp": "2026-05-15T12:34:56Z"
}
```

These are weaker-confirmed than manual station control because the latest Home Assistant integration does not appear to expose them directly as user actions.

## Confirmed WebSocket Events

Observed event names in the maintained Home Assistant integration:

- `battery_status`
- `change_mode`
- `device_idle`
- `fault`
- `fs_status_update`
- `program_changed`
- `rain_delay`
- `set_manual_preset_runtime`
- `watering_complete`
- `watering_in_progress_notification`

Important event shapes:

### `watering_in_progress_notification`

Observed fields include:

- `device_id`
- `program`
- `current_station`
- `run_time`
- `started_watering_station_at`
- `timestamp`

### `watering_complete`

Observed fields include:

- `device_id`
- `timestamp`

### `program_changed`

Used to reflect:

- create
- update
- delete or destroy
- smart-program enable/disable changes

### `rain_delay`

Observed fields include:

- `device_id`
- `delay`

## Actions We Can Reliably Design For

These are the best-supported first-version library actions for sprinkler timers:

- login with email/password
- list devices
- get a device by id
- list sprinkler programs
- update a non-smart program
- fetch recent watering history
- fetch zone landscape/smart-watering metadata
- update zone landscape data
- enable or disable smart watering for a zone by updating device zone config
- connect to live event stream
- start manual watering for one or more stations
- stop manual watering
- start a program manually
- set or clear rain delay
- set the manual preset runtime

## Actions That Need Caution

- switching whole-device mode to `auto` or `off`
- broad device updates beyond zone smart-watering flags
- assumptions about all product lines using the same schema
- flood sensor support if our initial library is focused only on sprinklers

## Recommended JS Library Shape

### Core transport

- `login(email, password): Promise<AuthSession>`
- `request(method, path, options): Promise<any>`
- `connectEvents(): Promise<void>`
- `sendEvent(payload): Promise<void>`

### Resource APIs

- `getDevices(): Promise<Device[]>`
- `getPrograms(): Promise<Program[]>`
- `getWateringHistory(deviceId, options?): Promise<WateringEvent[]>`
- `getLandscapes(deviceId): Promise<Landscape[]>`
- `updateProgram(programId, patch): Promise<void>`
- `updateLandscape(landscapeId, patch): Promise<void>`
- `updateDevice(deviceId, patch): Promise<void>`

### Control APIs

- `startZones(deviceId, stations)`
- `stopWatering(deviceId)`
- `startProgram(deviceId, programRef)`
- `setRainDelay(deviceId, hours)`
- `clearRainDelay(deviceId)`
- `setManualPresetRuntime(deviceId, minutes)`
- `setZoneSmartWatering(deviceId, zoneId, enabled)`

### Event model

- expose raw events
- also normalize common events into typed callbacks

Example:

- `on("watering_in_progress", handler)`
- `on("watering_complete", handler)`
- `on("program_changed", handler)`
- `on("raw", handler)`

### Reliability features

- automatic WebSocket reconnect with backoff
- heartbeat ping every 25 seconds
- ability to re-login and refresh token
- debug logger with raw request and event tracing
- permissive token parsing:
  - `orbit_api_key`
  - `orbit_session_token`

## Suggested Scope For v1

I would keep v1 focused on sprinkler timers and manual control:

- auth
- device discovery
- live event stream
- run zone
- stop zone
- rain delay
- program listing
- program start

Then add editing support in v1.1:

- update programs
- smart watering toggles
- landscape updates

## Open Questions To Verify In Implementation

- Does the live API currently return `orbit_api_key`, `orbit_session_token`, or both?
- Does `GET /v1/devices` require `user_id` for some accounts?
- For program start, is the websocket `program` field always just the numeric program id, or sometimes a richer object/string token?
- Can manual watering queue multiple stations reliably via a single `stations[]` payload on all sprinkler timer models?
- Are `auto` and `off` still accepted device modes on current firmware/cloud behavior?
- Do any endpoints require browser-cookie context for some account types?

## Sources

- Home Assistant B-hyve integration repo: [github.com/sebr/bhyve-home-assistant](https://github.com/sebr/bhyve-home-assistant)
- Python client: [client.py](https://raw.githubusercontent.com/sebr/bhyve-home-assistant/main/custom_components/bhyve/pybhyve/client.py)
- Python websocket transport: [websocket.py](https://raw.githubusercontent.com/sebr/bhyve-home-assistant/main/custom_components/bhyve/pybhyve/websocket.py)
- Home Assistant valve actions: [valve.py](https://raw.githubusercontent.com/sebr/bhyve-home-assistant/main/custom_components/bhyve/valve.py)
- Home Assistant switch/program actions: [switch.py](https://raw.githubusercontent.com/sebr/bhyve-home-assistant/main/custom_components/bhyve/switch.py)
- Home Assistant service descriptions: [services.yaml](https://raw.githubusercontent.com/sebr/bhyve-home-assistant/main/custom_components/bhyve/services.yaml)
- Node wrapper repo: [github.com/billchurch/bhyve-api](https://github.com/billchurch/bhyve-api)
- Node wrapper client: [src/index.js](https://raw.githubusercontent.com/billchurch/bhyve-api/main/src/index.js)
- Older Node remote: [src/lib/api.js](https://raw.githubusercontent.com/blacksmithlabs/orbit-bhyve-remote/master/src/lib/api.js)
- Official Orbit manual watering guide: [Manual Watering in the B-hyve App](https://community.orbitonline.com/manual-watering-in-the-b-hyve-app/)
- Official Orbit rain delay guide: [Creating a Rain Delay from the B-hyve app](https://community.orbitonline.com/creating-a-rain-delay-from-the-b-hyve-app/)
- Official Orbit smart watering guide: [How to Create a Smart Water Program on Your B-hyve Application](https://community.orbitonline.com/how-to-create-a-smart-water-program-on-your-b-hyve-application/)
