import { writable, type Writable } from 'svelte/store';
import { load } from '@tauri-apps/plugin-store';
import { OWTheme, WoWTheme, type GameTheme } from './data';

// Init Tauri store
const store = await load('store.json');

// Create Svelte store
export const GameThemeStore: Writable<GameTheme[]> = writable([]);

// Load initial value from Tauri store
(async () => {
  const saved = await store.get<GameTheme[]>('game-themes');
  if (saved?.length) {
    GameThemeStore.set(saved);
  } else {
    GameThemeStore.set([WoWTheme, OWTheme]);
  }
})();

// Persist changes automatically
GameThemeStore.subscribe((value) => {
  persistThemes(value);
});

async function persistThemes(value: GameTheme[]) {
  await store.set('game-themes', value);
  await store.save();
}
