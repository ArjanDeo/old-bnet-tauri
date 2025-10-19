import { load } from '@tauri-apps/plugin-store';

export enum ExpansionPrefix {
  Classic = "classic",
  TBC = "tbc",
  WotLK = "wotlk",
  Cata = "cata",
  MoP = "mop",
  WoD = "wod",
  Legion = "legion",
  BfA = "bfa",
  SL = "sl",
  DF = "df",
  TWW = "tww",
  Midnight = "midnight"
}

// Initialize store
const store = await load("store.json");
export let currentStylePrefix: ExpansionPrefix = ExpansionPrefix.Midnight;

export async function loadLauncherStyle() {
  const val = await store.get<{ value: string }>('launcher-style');
  if (val?.value && Object.values(ExpansionPrefix).includes(val.value as ExpansionPrefix)) {
    currentStylePrefix = val.value as ExpansionPrefix;
  } else {
    currentStylePrefix = ExpansionPrefix.Midnight;
    await store.set('launcher-style', { value: currentStylePrefix });
    await store.save();
  }
}

export async function setLauncherStyle(style: ExpansionPrefix): Promise<void> {
  currentStylePrefix = style;
  await store.set('launcher-style', { value: style });
  await store.save();
}

// Simplified configuration - only focal point adjustments needed
export interface LayoutConfig {
  bgFocalPoint: string; // object-position for background
  logoSize: 'small' | 'medium' | 'large' | 'xlarge'; // Predefined size categories
  transform: string;
}

const layoutConfigs: Record<ExpansionPrefix, LayoutConfig> = {
  [ExpansionPrefix.Classic]: { bgFocalPoint: 'center', logoSize: 'medium', transform: 'transform scale-125' },
  [ExpansionPrefix.TBC]: { bgFocalPoint: 'center', logoSize: 'medium', transform: 'transform scale-125' },
  [ExpansionPrefix.WotLK]: { bgFocalPoint: 'center', logoSize: 'medium', transform: 'transform scale-125' },
  [ExpansionPrefix.Cata]: { bgFocalPoint: 'center', logoSize: 'medium', transform: 'transform scale-125' },
  [ExpansionPrefix.MoP]: { bgFocalPoint: 'center', logoSize: 'medium', transform: 'transform scale-125' },
  [ExpansionPrefix.WoD]: { bgFocalPoint: 'center', logoSize: 'medium', transform: 'transform scale-125' },

  [ExpansionPrefix.Legion]: { bgFocalPoint: '-20% center', logoSize: 'medium', transform: 'transform scale-200 translate-y-10 2xl:translate-x-130 origin-center' },

  [ExpansionPrefix.BfA]: { bgFocalPoint: '-20% center', logoSize: 'medium', transform: 'transform scale-160 2xl:scale-115 translate-y-60 2xl:translate-y-12 -translate-x-50 origin-center' },
  [ExpansionPrefix.SL]: { bgFocalPoint: '25% center', logoSize: 'medium', transform: 'transform scale-150 2xl:scale-140 translate-y-48 translate-x-15 2xl:translate-x-20 origin-center' },
  [ExpansionPrefix.DF]: { bgFocalPoint: '35% center', logoSize: 'medium', transform: 'transform scale-200' },
  [ExpansionPrefix.TWW]: { bgFocalPoint: 'center', logoSize: 'medium', transform: 'transform scale-130 2xl:scale-120 translate-y-25 2xl:translate-y-12 translate-x-36 2xl:translate-x-48 origin-center' },
  [ExpansionPrefix.Midnight]: { bgFocalPoint: 'center', logoSize: 'medium', transform: 'transform scale-160 2xl:transform 2xl:scale-145 translate-y-22 2xl:translate-y-12 translate-x-96 origin-center' },
};

export function getLayoutConfig(style: ExpansionPrefix): LayoutConfig {
  return layoutConfigs[style] || layoutConfigs[ExpansionPrefix.Midnight];
}