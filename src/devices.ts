import { createRequest } from "./bhyve-api.js"
import type { AuthSession, Device, RawDevice, RawDeviceResponse, Zone } from "./types.js"

export const getDevices = async (session: AuthSession ):Promise<Device[]> => {
  const request = createRequest(session);
  const raw = await request("/v1/devices");
  return rawDevicesToDevices(raw as RawDeviceResponse)
}

export const rawToDevice = (raw: RawDevice): Device => {
  return {
    id: raw.id ?? "",
    name: raw.name ?? "Unknown",
    device_type: raw.device_type ?? "unknown",
    zones: (raw.zones as unknown as Zone[]) ?? [],
    smart_watering_enabled: raw.smart_watering_enabled ?? false,
  }
}

export const rawDevicesToDevices = (raw: RawDeviceResponse): Device[] => {
  return (raw.devices ?? []).map(rawToDevice)
}
