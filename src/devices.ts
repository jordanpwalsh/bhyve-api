
export type Zone = {
  station: number;
  name: string;
  smart_watering_enabled: boolean;
}

export type RawZone = Record<string, unknown> & 
{
  station?: number,
  name?: string,
  smart_watering_enabled?: boolean;
}

export type Device = {
  id: string;
  name: string;
  device_type: string;
  zones: Zone[];
  smart_watering_enabled: boolean;
}

export type RawDevice = Record<string, unknown> & {
  id?: string;
  name?: string;
  device_type?: string;
  zones?: unknown[];
  smart_watering_enabled?: boolean;
}

export type RawDeviceResponse = {
  devices?: RawDevice[];
}

export type SendDevicesRequest = () => Promise<RawDeviceResponse>

export const getDevices = async (sendDevicesRequest: SendDevicesRequest):Promise<Device[]> => {
  const raw = await sendDevicesRequest()
  return rawDevicesToDevices(raw as RawDeviceResponse)
}

export const rawToZone = (raw: RawZone): Zone => {
  return {
    station: raw.station ?? 0,
    name: raw.name ?? "Unknown zone",
    smart_watering_enabled: raw.smart_watering_enabled ?? false,
  }
}
export const rawToDevice = (raw: RawDevice): Device => {
  return {
    id: raw.id ?? "",
    name: raw.name ?? "Unknown",
    device_type: raw.device_type ?? "unknown",
    zones: (raw.zones ?? []).map((zone) => rawToZone(zone as RawZone)),
    smart_watering_enabled: raw.smart_watering_enabled ?? false,
  }
}

export const rawDevicesToDevices = (raw: RawDeviceResponse): Device[] => {
  return (raw.devices ?? []).map(rawToDevice)
}
