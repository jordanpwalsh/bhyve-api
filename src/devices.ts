import type { Device, RawDevice, RawDeviceResponse, Zone } from "./types.js"

export const rawToDevice = (raw: RawDevice): Device => {
  return {
    id: raw.id ?? "",
    name: raw.name ?? "Unknown",
    device_type: raw.device_type ?? "uknown",
    zones: (raw.zones as unknown as Zone[]) ?? [],
    smart_watering_enabled: raw.smart_watering_enabled ?? false,
  }
}

export const rawDevicesToDevices = (raw: RawDeviceResponse): Device[] => {
  return (raw.devices ?? []).map(rawToDevice)
}
