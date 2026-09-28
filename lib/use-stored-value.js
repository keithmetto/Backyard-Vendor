"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  PRODUCTS_STORAGE_KEY,
  parseProducts,
  serializeProducts,
} from "@/lib/product-store";
import {
  SETTINGS_STORAGE_KEY,
  parseSettings,
  serializeSettings,
} from "@/lib/settings-store";

/** Returned during server rendering and hydration, before storage is readable. */
const NOT_READY = Symbol("not-ready");

const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readRaw(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {string} value
 * @returns {boolean} false when the browser refuses the write (quota, private mode)
 */
export function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}

function useStoredRaw(key) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => NOT_READY,
  );
  return { raw: raw === NOT_READY ? null : raw, ready: raw !== NOT_READY };
}

export function useProducts() {
  const { raw, ready } = useStoredRaw(PRODUCTS_STORAGE_KEY);
  const products = useMemo(() => (ready ? parseProducts(raw) : []), [raw, ready]);
  const saveProducts = useCallback(
    (next) => writeStoredValue(PRODUCTS_STORAGE_KEY, serializeProducts(next)),
    [],
  );
  return { products, ready, saveProducts };
}

export function useSettings() {
  const { raw, ready } = useStoredRaw(SETTINGS_STORAGE_KEY);
  const settings = useMemo(() => parseSettings(raw), [raw]);
  const saveSettings = useCallback(
    (next) => writeStoredValue(SETTINGS_STORAGE_KEY, serializeSettings(next)),
    [],
  );
  return { settings, ready, saveSettings };
}
