export type Credentials = {
  email: string;
  password: string;
}

export type AuthSession = {
  token: string;
}


export type Zone = {
  station: number;
  name: string;
  smart_watering_enabled: boolean;
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


