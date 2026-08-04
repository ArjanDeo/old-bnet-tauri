<script lang="ts">
  import { dev } from '$app/environment';
  import { InfoIcon, User } from 'lucide-svelte';
  import Dropdown from '../../components/dropdown.svelte';
  import { generateState, WoWExpansionLabels, WoWExpansionPrefix, WoWTheme, type GameTheme } from '../../data';
  import { GameThemeStore, getFromStore, setToStore } from '../../stores';
  import { onMount, onDestroy } from 'svelte';
  import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

  let selectedExpansion: WoWExpansionPrefix = $state(WoWExpansionPrefix.Midnight);
  let playMusic = $state(false);
  let trackWoWPlaytime = $state(false);
  let isLoading = $state(true);
  let isAuthenticated = $state(false);

  async function checkAuth() {
    const accessToken = await getFromStore('access_token');
    isAuthenticated = !!accessToken;
  }

  let wowTheme: GameTheme | undefined;

  const unsubscribe = GameThemeStore.subscribe((themes) => {
    wowTheme = themes.find(t => t.game === 'wow');
    if (wowTheme) {
      selectedExpansion = wowTheme.activePrefix as WoWExpansionPrefix;
    }
  });

  async function selectStyle(xpac: string) {
    if (!wowTheme) return;
    const xpacInternalValue = WoWExpansionLabels[xpac];
    WoWTheme.activePrefix = xpacInternalValue;
    await setToStore('game-theme', WoWTheme);
    selectedExpansion = xpacInternalValue;
  }

  onMount(async () => {
    await checkAuth();
    try {
      const [storedPlayMusic, storedTrackPlaytime] = await Promise.all([
        getFromStore('settings-playMusic'),
        getFromStore('settings-trackWoWPlaytime')
      ]);

      const theme: GameTheme = await getFromStore('game-theme');
      const enumValue = theme.activePrefix;
      const enumKey = Object.keys(WoWExpansionPrefix).find(
        key => WoWExpansionPrefix[key as keyof typeof WoWExpansionPrefix] === enumValue
      );
      if (enumKey) {
        selectedExpansion = WoWExpansionPrefix[enumKey as keyof typeof WoWExpansionPrefix];
      }

      if (storedPlayMusic !== null) playMusic = storedPlayMusic;
      if (storedTrackPlaytime !== null) trackWoWPlaytime = storedTrackPlaytime;
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      isLoading = false;
    }
  });

  $effect(() => {
    if (isLoading) return;
    setToStore('settings-playMusic', playMusic).catch(error =>
      console.error('Failed to save playMusic setting:', error)
    );
  });

  $effect(() => {
    if (isLoading) return;
    setToStore('settings-trackWoWPlaytime', trackWoWPlaytime).catch(error =>
      console.error('Failed to save trackWoWPlaytime setting:', error)
    );
  });

  onDestroy(() => {
    unsubscribe();
  });

  const startBnetOAuth = async () => {
    const authUrl =
      "https://oauth.battle.net/authorize" +
      "?client_id=c3a1ab081a1b4316ac819b4b7416d1e9" +
      `&redirect_uri=${dev ? 'https://localhost:7176/old-bnet-tauri-callback' : 'https://twistingnetherapi.furyshiftz.com/old-bnet-tauri-callback'}` +
      "&response_type=code" +
      "&scope=wow.profile openid" +
      `&state=${generateState()}`;

    const win = new WebviewWindow("bnet-oauth", {
      url: authUrl,
      title: "Battle.net Connection",
      width: 500,
      height: 700,
      resizable: false
    });

    return win;
  }
</script>

<div class="w-full max-w-lg mx-auto p-6 flex flex-col gap-3">

  <div class="bg-[#1f1f2a] border border-white/10 rounded-xl p-5">
    <p class="text-sm text-gray-400 mb-2">WoW theme</p>
    <Dropdown
      items={Object.keys(WoWExpansionLabels)}
      selected={Object.entries(WoWExpansionLabels).find(([_, xpac]) => xpac === selectedExpansion)?.[0] ?? ''}
      onSelect={(xpac: string) => selectStyle(xpac)}
    />
  </div>

  <div class="bg-[#1f1f2a] border border-white/10 rounded-xl p-5 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-white text-sm">Play theme music</p>
        <p class="text-gray-500 text-xs mt-0.5">Plays on game pages</p>
      </div>
      <label class="relative inline-block w-9 h-5 cursor-pointer">
        <input type="checkbox" bind:checked={playMusic} disabled={isLoading} class="peer sr-only" />
        <span class="absolute inset-0 rounded-full bg-gray-600 peer-checked:bg-blue-600 transition-colors"></span>
        <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
      </label>
    </div>

    <div class="border-t border-white/10"></div>

    <div class="flex items-center justify-between">
      <div>
        <p class="text-white text-sm">Track playtime</p>
        <p class="text-gray-500 text-xs mt-0.5">
          Requires
          
            <a href="https://github.com/ArjanDeo/TotalPlayed"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-500 hover:text-blue-400 underline">
            TotalPlayed</a> addon
        </p>
      </div>
      <label class="relative inline-block w-9 h-5 cursor-pointer">
        <input type="checkbox" bind:checked={trackWoWPlaytime} disabled={isLoading} class="peer sr-only" />
        <span class="absolute inset-0 rounded-full bg-gray-600 peer-checked:bg-blue-600 transition-colors"></span>
        <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
      </label>
    </div>
  </div>

  <div class="bg-[#1f1f2a] border border-white/10 rounded-xl p-5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
        <User size="18" class="text-blue-400" />
      </div>
      <div class="flex items-center gap-2">
        <div>
          <p class="text-white text-sm">Battle.net account</p>
          <p class="text-gray-500 text-xs mt-0.5">
            {isAuthenticated ? 'Connected' : 'Enables character overviews'}
          </p>
        </div>
        <div class="relative group">
          <InfoIcon size="14" class="text-gray-500 hover:text-gray-300 transition-colors" />
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg">
            Connecting gives access to advanced features like WoW character overviews.
            <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
    <button
      onclick={startBnetOAuth}
      disabled={isAuthenticated}
      class="px-3 py-1.5 text-sm rounded-lg transition-colors disabled:bg-transparent disabled:text-gray-500 disabled:border disabled:border-white/10 disabled:cursor-not-allowed enabled:bg-blue-600 enabled:hover:bg-blue-700 enabled:text-white enabled:cursor-pointer"
    >
      {isAuthenticated ? 'Connected' : 'Connect'}
    </button>
  </div>

</div>