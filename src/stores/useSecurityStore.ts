import { create } from "zustand";
import {
  createPinCredentials,
  loadSecurityState,
  persistSecurityState,
  verifyPin,
} from "../services/securityStorage";
import type { AutoLockMinutes } from "../types/security";

type SecurityStore = {
  autoLockMinutes: AutoLockMinutes;
  hasPin: boolean;
  hideSensitiveValues: boolean;
  isLocked: boolean;
  lock: () => void;
  removePin: () => void;
  setAutoLockMinutes: (minutes: AutoLockMinutes) => void;
  setHideSensitiveValues: (hideSensitiveValues: boolean) => void;
  setPin: (pin: string) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
};

const initialState = loadSecurityState();

export const useSecurityStore = create<SecurityStore>((set, get) => ({
  autoLockMinutes: initialState.autoLockMinutes,
  hasPin: Boolean(initialState.pinHash && initialState.pinSalt),
  hideSensitiveValues: initialState.hideSensitiveValues,
  isLocked: Boolean(initialState.pinHash && initialState.pinSalt),
  lock: () => {
    if (get().hasPin) {
      set({ isLocked: true });
    }
  },
  removePin: () =>
    set((state) => {
      persistSecurityState({
        autoLockMinutes: state.autoLockMinutes,
        hideSensitiveValues: state.hideSensitiveValues,
        pinHash: null,
        pinSalt: null,
      });

      return {
        hasPin: false,
        isLocked: false,
      };
    }),
  setAutoLockMinutes: (autoLockMinutes) =>
    set((state) => {
      const current = loadSecurityState();
      persistSecurityState({
        ...current,
        autoLockMinutes,
        hideSensitiveValues: state.hideSensitiveValues,
      });

      return { autoLockMinutes };
    }),
  setHideSensitiveValues: (hideSensitiveValues) =>
    set((state) => {
      const current = loadSecurityState();
      persistSecurityState({
        ...current,
        autoLockMinutes: state.autoLockMinutes,
        hideSensitiveValues,
      });

      return { hideSensitiveValues };
    }),
  setPin: async (pin) => {
    const credentials = await createPinCredentials(pin);
    const state = get();

    persistSecurityState({
      autoLockMinutes: state.autoLockMinutes,
      hideSensitiveValues: state.hideSensitiveValues,
      pinHash: credentials.pinHash,
      pinSalt: credentials.pinSalt,
    });

    set({
      hasPin: true,
      isLocked: false,
    });
  },
  unlockWithPin: async (pin) => {
    const state = loadSecurityState();

    if (!state.pinHash || !state.pinSalt) {
      set({ isLocked: false });
      return true;
    }

    const isValid = await verifyPin(pin, state.pinSalt, state.pinHash);

    if (isValid) {
      set({ isLocked: false });
    }

    return isValid;
  },
}));
