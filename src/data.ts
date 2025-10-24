import { load } from '@tauri-apps/plugin-store';

export enum GamePrefix {
  WoW = "wow",
  SC2 = "sc2",
  D3 = "d3",
  HS = "hs",
  HOTS = "hots",
  OW = "ow",
}



export enum WoWExpansionPrefix {
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
  Midnight = "midnight",
}
export const WoWExpansionLabels: Record<string, WoWExpansionPrefix> = {
  "Vanilla": WoWExpansionPrefix.Classic,
  "The Burning Crusade": WoWExpansionPrefix.TBC,
  "Wrath of the Lich King": WoWExpansionPrefix.WotLK,
  "Cataclysm": WoWExpansionPrefix.Cata,
  "Mists of Pandaria": WoWExpansionPrefix.MoP,
  "Warlords of Draenor": WoWExpansionPrefix.WoD,
  "Legion": WoWExpansionPrefix.Legion,
  "Battle for Azeroth": WoWExpansionPrefix.BfA,
  "Shadowlands": WoWExpansionPrefix.SL,
  "Dragonflight": WoWExpansionPrefix.DF,
  "The War Within": WoWExpansionPrefix.TWW,
  "Midnight": WoWExpansionPrefix.Midnight,
};

export enum OWPrefix {
  OW = "ow",
  OW2 = "ow2",
}

export interface LayoutConfig {
  bgFocalPoint: string;
  logoSize: "small" | "medium" | "large" | "xlarge";
  transform: string;
  cinematicUrl: string;
}

const WoWLayoutConfigs: Record<WoWExpansionPrefix, LayoutConfig> = {
  [WoWExpansionPrefix.Classic]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-125',
    cinematicUrl: 'https://www.youtube.com/embed/vlVSJ0AvZe0'
  },
  [WoWExpansionPrefix.TBC]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-125',
    cinematicUrl: 'https://www.youtube.com/embed/IBHL_-biMrQ'
  },
  [WoWExpansionPrefix.WotLK]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-110',
    cinematicUrl: 'https://www.youtube.com/embed/BCr7y4SLhck'
  },
  [WoWExpansionPrefix.Cata]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-160 2xl:scale-120 3xl:scale-115   2xl:-translate-y-20 3xl:translate-y-12 translate-x-30 2xl:translate-x-40 origin-center',
    cinematicUrl: 'https://www.youtube.com/embed/Wq4Y7ztznKc'
  },
  [WoWExpansionPrefix.MoP]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-160 2xl:scale-140 3xl:scale-115 translate-y-60  2xl:translate-y-40 3xl:translate-y-12 -translate-x-70 origin-center',
    cinematicUrl: 'https://www.youtube.com/embed/wvYXoyxLv64'
  },
  [WoWExpansionPrefix.WoD]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform 2xl:scale-151 3xl:scale-115 scale-170 2xl:translate-y-60 translate-y-60 3xl:translate-y-30  translate-x-110 2xl:translate-x-130 origin-center',
    cinematicUrl: 'https://www.youtube.com/embed/TLzhlsEFcVQ'
  },

  [WoWExpansionPrefix.Legion]: { 
    bgFocalPoint: '-20% center', 
    logoSize: 'medium', 
    transform: 'transform scale-200 translate-y-10 2xl:translate-x-130 origin-center',
    cinematicUrl: 'https://www.youtube.com/embed/eYNCCu0y-Is'
  },

  [WoWExpansionPrefix.BfA]: { 
    bgFocalPoint: '-20% center', 
    logoSize: 'medium', 
    transform: 'transform scale-160 2xl:scale-140 3xl:scale-115 translate-y-20  2xl:translate-y-50 3xl:translate-y-12 -translate-x-50 origin-center',
    cinematicUrl: 'https://www.youtube.com/embed/jSJr3dXZfcg'
  },
  [WoWExpansionPrefix.SL]: { 
    bgFocalPoint: '25% center', 
    logoSize: 'medium', 
    transform: 'transform scale-150 2xl:scale-140 translate-y-45 translate-x-15 2xl:translate-x-20 origin-center',
    cinematicUrl: 'https://www.youtube.com/embed/s4gBChg6AII'
  },
  [WoWExpansionPrefix.DF]: { 
    bgFocalPoint: '35% center', 
    logoSize: 'medium', 
    transform: 'transform scale-200',
    cinematicUrl: 'https://www.youtube.com/embed/3ZtedjN1JXY'
  },
  [WoWExpansionPrefix.TWW]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-130 2xl:scale-120 translate-y-22 3xl:translate-y-12 translate-x-36 3xl:translate-x-48 origin-center',
    cinematicUrl: 'https://www.youtube.com/embed/o03STclgxSc'
  },
  [WoWExpansionPrefix.Midnight]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-110 3xl:transform 3xl:scale-145 -translate-y-10 3xl:translate-y-12 translate-x-30 origin-center',
    cinematicUrl: 'https://www.youtube.com/embed/SiIjThwKLaE'
  },
};

const OWLayoutConfigs: Record<OWPrefix, LayoutConfig> = {
  [OWPrefix.OW]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-125',
    cinematicUrl: 'https://www.youtube.com/embed/FqnKB22pOC0'
  },
  [OWPrefix.OW2]: { 
    bgFocalPoint: 'center', 
    logoSize: 'medium', 
    transform: 'transform scale-125',
    cinematicUrl: 'https://www.youtube.com/embed/GKXS_YA9s7E'
  }
};
export const WoWTheme: GameTheme = {
  game: GamePrefix.WoW,
  activePrefix: WoWExpansionPrefix.Midnight, // default starting expansion
  config: WoWLayoutConfigs, // full config record
};

export const OWTheme: GameTheme = {
  game: GamePrefix.OW,
  activePrefix: OWPrefix.OW2, // default to OW2
  config: OWLayoutConfigs,
};

const LayoutsByGame: Record<GamePrefix, Record<string, LayoutConfig>> = {
  [GamePrefix.WoW]: WoWLayoutConfigs,
  [GamePrefix.OW]: OWLayoutConfigs,
  [GamePrefix.SC2]: {},
  [GamePrefix.D3]: {},
  [GamePrefix.HS]: {},
  [GamePrefix.HOTS]: {},
};
export interface GameTheme {
  game: GamePrefix,
  activePrefix: string,
  config: Record<string, LayoutConfig>,
}

const store = await load("store.json");

export async function loadTheme(game: GamePrefix, defaultPrefix: string): Promise<string> {
  const key = `${game}-theme`;
  const val = await store.get<{ value: string }>(key);

  const configKeys = Object.keys(LayoutsByGame[game]);
  const chosen = val?.value && configKeys.includes(val.value)
    ? val.value
    : defaultPrefix;

  await store.set(key, { value: chosen });
  await store.save();
  return chosen;
}

export async function setTheme(game: GamePrefix, style: string): Promise<void> {
  const key = `${game}-theme`;
  await store.set(key, { value: style });
  await store.save();
}

export function getLayoutConfig(game: GamePrefix, style: string): LayoutConfig | undefined {
  return LayoutsByGame[game]?.[style];
}
  export interface DropdownItem {
    key: string;
    label: string;
  }