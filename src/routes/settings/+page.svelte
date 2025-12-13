<script lang="ts">
  import { dev } from '$app/environment';
  import { InfoIcon } from 'lucide-svelte';
  import Dropdown from '../../components/dropdown.svelte';
  import { generateState, WoWExpansionLabels, WoWExpansionPrefix, type GameTheme } from '../../data';
  import { GameThemeStore, getFromStore, setToStore } from '../../stores';
  import { onMount, onDestroy } from 'svelte';
    import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
  let selectedExpansion: WoWExpansionPrefix = WoWExpansionPrefix.Midnight;
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
  
  function selectStyle(xpac: string) {
    if (!wowTheme) return;
    
    const xpacInternalValue = WoWExpansionLabels[xpac];
    const index = Object.values(WoWExpansionPrefix).indexOf(xpacInternalValue);
    
    GameThemeStore.update(themes =>
      themes.map(t =>
        t.game === 'wow' ? { ...t, activePrefix: xpacInternalValue, activeIndex: index } : t
      )
    );
    
    selectedExpansion = xpacInternalValue;
  }
  
  onMount(async () => {
    await checkAuth();
    try {
      const [storedPlayMusic, storedTrackPlaytime] = await Promise.all([
        getFromStore('settings-playMusic'),
        getFromStore('settings-trackWoWPlaytime')
      ]);
      
      if (storedPlayMusic !== null) playMusic = storedPlayMusic;
      if (storedTrackPlaytime !== null) trackWoWPlaytime = storedTrackPlaytime;
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      isLoading = false;
    }
  });
  
  // Separate effect for saving settings
  $effect(() => {
    // Skip saving during initial load
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

  // For OAuth


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

<div class="w-full p-4">
  <section class="mb-6">
    <h2 class="text-white text-lg font-semibold mb-2">Change WoW Theme</h2>
    <Dropdown
      items={Object.keys(WoWExpansionLabels)}
      selected={Object.entries(WoWExpansionLabels).find(([_, xpac]) => xpac === selectedExpansion)?.[0] ?? ''}
      onSelect={(xpac: string) => selectStyle(xpac)}
    />
  </section>
  
  <section class="mb-6">
    <label class="flex items-center gap-3 cursor-pointer group">
      <input 
        type="checkbox" 
        bind:checked={playMusic}
        disabled={isLoading}
        class="w-4 h-4 cursor-pointer accent-blue-500"
      />
      <span class="text-white group-hover:text-gray-200 transition-colors">
        Play theme music on game pages
      </span>
    </label>
  </section>
  
  <section>
    <label class="flex items-start gap-3 cursor-pointer group">
      <input 
        type="checkbox" 
        bind:checked={trackWoWPlaytime}
        disabled={isLoading}
        class="w-4 h-4 mt-1 cursor-pointer accent-blue-500"
      />
      <span class="text-white group-hover:text-gray-200 transition-colors">
        Track Playtime for WoW
        <span class="block text-sm text-gray-400 mt-1">
          Requires <a 
            href="https://github.com/ArjanDeo/TotalPlayed" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-blue-500 hover:text-blue-400 transition-colors underline"
          >TotalPlayed</a> addon
        </span>
      </span>
    </label>
  </section>
  <section class="mt-6">
    <div class="relative group">
      <InfoIcon size="16" class="text-blue-400 hover:text-blue-300 transition-colors" />
      <div class="absolute  bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg">
        Connecting to your Battle.Net account gives access to advanced features like WoW character overviews.
        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
    <button 
      onclick={startBnetOAuth} 
      class="bg-blue-700 hover:bg-blue-800 transition-colors ease-in cursor-pointer p-3 mt-1 rounded-xl flex flex-row gap-x-2"
      disabled={isAuthenticated}
    >
      <img src="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/battle_net_logo.webp" alt="battle.net logo" class="w-6 h-6" />
      {#if isAuthenticated}
        Connected!
      {:else}
        Connect to Battle.Net account
      {/if}
    </button>
  </section>
</div>