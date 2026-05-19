import type { AutoLockMinutes } from "../types/security";

const STORAGE_KEY = "controle-de-gastos.security.v1";

export type PersistedSecurityState = {
  autoLockMinutes: AutoLockMinutes;
  hideSensitiveValues: boolean;
  pinHash: string | null;
  pinSalt: string | null;
};

const defaultSecurityState: PersistedSecurityState = {
  autoLockMinutes: 5,
  hideSensitiveValues: false,
  pinHash: null,
  pinSalt: null,
};

export function loadSecurityState(): PersistedSecurityState {
  if (typeof window === "undefined") {
    return defaultSecurityState;
  }

  const rawState = window.localStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    return defaultSecurityState;
  }

  try {
    const parsedState = JSON.parse(rawState) as Partial<PersistedSecurityState>;

    return {
      autoLockMinutes: isAutoLockMinutes(parsedState.autoLockMinutes)
        ? parsedState.autoLockMinutes
        : defaultSecurityState.autoLockMinutes,
      hideSensitiveValues:
        typeof parsedState.hideSensitiveValues === "boolean"
          ? parsedState.hideSensitiveValues
          : defaultSecurityState.hideSensitiveValues,
      pinHash:
        typeof parsedState.pinHash === "string" ? parsedState.pinHash : null,
      pinSalt:
        typeof parsedState.pinSalt === "string" ? parsedState.pinSalt : null,
    };
  } catch {
    return defaultSecurityState;
  }
}

export function persistSecurityState(state: PersistedSecurityState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function createPinCredentials(pin: string) {
  const salt = createSalt();

  return {
    pinSalt: salt,
    pinHash: await hashPin(pin, salt),
  };
}

export async function verifyPin(pin: string, salt: string, expectedHash: string) {
  const hash = await hashPin(pin, salt);
  return hash === expectedHash;
}

async function hashPin(pin: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

function createSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function isAutoLockMinutes(value: unknown): value is AutoLockMinutes {
  return value === 1 || value === 5 || value === 15 || value === 30;
}
