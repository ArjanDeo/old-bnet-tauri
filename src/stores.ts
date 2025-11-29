import { writable, type Writable } from 'svelte/store';
import { load, Store } from '@tauri-apps/plugin-store';
import { D3Theme, HotSTheme, HSTheme, OWTheme, SC2Theme, WoWTheme, type GameTheme } from './data';
import { browser } from '$app/environment';

let store: Store | null = null;
let storeInitialized = false;

async function persistThemesIfChanged(newThemes: GameTheme[]) {
  if (!store) return;

  const savedThemes = await store.get<GameTheme[]>("game-themes") ?? [];

  // Build updatedThemes by merging only changed configs
  const updated = newThemes.map(newItem => {
    const existing = savedThemes.find(s => s.game === newItem.game);

    if (!existing) {
      // Not saved before → save whole object
      return newItem;
    }

    // Compare config only
    const configChanged = JSON.stringify(existing.config) !== JSON.stringify(newItem.config);

    if (!configChanged) {
      // No config changes → reuse the existing one (don’t overwrite)
      return existing;
    }

    // Config changed → merge keeping static defaults from newItem
    return {
      ...existing,          // user-specific saved values
      ...newItem,           // static up-to-date defaults (name, icon, etc)
      config: {
        ...existing.config,
        ...newItem.config   // changed config only
      }
    };
  });

  // Save final merged array
  await store.set("game-themes", updated);
  await store.save();
}



// Async function to initialize store
async function initStore() {
  if (!browser || storeInitialized) return;
  
  try {
    store = await load('store.json');
    storeInitialized = true;
    
    // Load initial value from Tauri store
    const saved = await store.get<GameTheme[]>('game-themes');
    if (saved?.length) {
      GameThemeStore.set(saved);
    } else {
      GameThemeStore.set([WoWTheme, OWTheme, D3Theme, SC2Theme, HSTheme, HotSTheme]);
    }

  } catch (error) {
    console.error('Failed to initialize store:', error);
    // Fallback to default themes
    GameThemeStore.set([WoWTheme, OWTheme, D3Theme, SC2Theme, HSTheme, HotSTheme]);
  }
}

// Create Svelte store
export const GameThemeStore: Writable<GameTheme[]> = writable([]);

// Initialize store (non-blocking)
if (browser) {
  initStore();
}

// Persist changes automatically
GameThemeStore.subscribe((value) => {
  if (storeInitialized) {
    persistThemesIfChanged(value);
  }
});

async function persistThemes(value: GameTheme[]) {
  if (store) {
    try {
      await store.set('game-themes', value);
      await store.save();
    } catch (error) {
      console.error('Failed to persist themes:', error);
    }
  }
}

export async function getFromStore(key: string): Promise<any> {
  if (!storeInitialized) {
    await initStore();
  }
  if (store) {
    return await store.get(key);
  }
  return null;
}

export async function setToStore(key: string, value: any): Promise<boolean> {
  if (!storeInitialized) {
    await initStore();
  }
  
  if (store) {
    try {
      await store.set(key, value);
      await store.save();
      console.log('' + key + ' = ' + value)
      return true;
    } catch (e) {
      console.error('Failed to set store value:', e);
      return false;
    }
  }
  return false;
}