// src/stores.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { load } from '@tauri-apps/plugin-store';
import { ExpansionPrefix } from './data';

// Tauri store
const store = await load('store.json');

// Load initial value from store or default
const val = await store.get<{ value: string }>('launcher-style');
const initialStyle: ExpansionPrefix =
  val?.value && Object.values(ExpansionPrefix).includes(val.value as ExpansionPrefix)
    ? (val.value as ExpansionPrefix)
    : ExpansionPrefix.Midnight;

// Create a writable Svelte store
export const launcherStyle: Writable<ExpansionPrefix> = writable(initialStyle);

// Subscribe to save changes to Tauri store automatically
launcherStyle.subscribe(async (value) => {
  await store.set('launcher-style', { value });
  await store.save();
});
