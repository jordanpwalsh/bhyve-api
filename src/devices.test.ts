import test from "node:test"
import assert from "node:assert/strict"

import { rawToDevice, rawDevicesToDevices, rawToZone, getDevices } from "./devices.js"

test("rawToDevice maps the basic device fields", () => {
  const device = rawToDevice({
    id: "abc",
    name: "Front Yard",
    device_type: "timer",
    smart_watering_enabled: true,
    zones: [],
  })

  assert.deepEqual(device, {
    id: "abc",
    name: "Front Yard",
    device_type: "timer",
    smart_watering_enabled: true,
    zones: [],
  })
})


test("rawToDevice supplies defaults for missing fields", () => {
  const device = rawToDevice({})
  assert.deepEqual(device, {
    id: "",
    name: "Unknown",
    device_type: "unknown",
    zones: [], 
    smart_watering_enabled: false,
  })
})


test("rawDevicesToDevices returns an empty list when devices is missing", () => {
  assert.deepEqual(rawDevicesToDevices({}),[])
})


test("rawToZone supplies defaults for missing fields", () => {
  assert.deepEqual(rawToZone({}), {
    station: 0,
    name: "Unknown zone",
    smart_watering_enabled: false
  })
})

test("rawToDevice maps nested zones", () => {
  const device = rawToDevice({
    zones: [{station:2}]
  })

  assert.deepEqual(device.zones, [
    {
      station: 2,
      name: "Unknown zone",
      smart_watering_enabled: false
    }
  ])
})

test("getDevices maps raw devices from the injected request", async () => {
  const fakeSendDevicesRequest = async () => {
    return {
      devices: [
        {
          id: "abc",
          name: "Front Yard",
          device_type: "timer",
          smart_watering_enabled: true,
          zones: [{station: 1, name: "Grass", smart_watering_enabled: false }],
        }
      ]
    }
  }

  const devices = await getDevices(fakeSendDevicesRequest)
  assert.deepEqual(devices, [
    {
      id: "abc",
      name: "Front Yard",
      device_type: "timer",
      smart_watering_enabled: true,
      zones: [{ station: 1, name: "Grass",
      smart_watering_enabled: false }],
    },
  ])
})
