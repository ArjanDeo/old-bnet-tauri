<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { CircleX, Settings, SquareCheckBig, InfoIcon } from 'lucide-svelte';
  import GameLogoPanel from "../../../components/GameLogoPanel.svelte";
  import Dropdown from "../../../components/dropdown.svelte";
  import { GamePrefix, WoWExpansionPrefix, getLayoutConfig, getWoWPlaytime, type GameTheme, type WowNewsPost, type WowProfileData } from "../../../data";
  import { GameThemeStore, getFromStore } from "../../../stores";
  import { onMount, onDestroy } from "svelte";
    import { dev } from "$app/environment";

  type VersionItem = { key: string; label: string; };

  let dropdownItems: VersionItem[] = $state([]);
  let selected = $state<VersionItem | null>(null);
  let wowDir = $state("");
  let wowTheme = $state<GameTheme>();
  let error = $state("");
  let wowVersions: Record<string, string> = $state({});
  let ptrNotification = $state(false);
  let classicNotification = $state(false);
  let playTime = $state(0);
  let isLaunching = $state(false);
  let isLoading = $state(true);
  let newsPosts: Array<WowNewsPost> | undefined = $state();
  let index = $state(0);
  let wowProfile = <WowProfileData> $state();
  const INTERVAL = 5000; // 5 seconds

  // Rotate automatically
  const interval = setInterval(() => {
    if (newsPosts && newsPosts.length > 0) {
      index = (index + 1) % newsPosts.length;
    }
  }, INTERVAL);

  let unsubscribe: (() => void) | null = null;

  async function launch_wow() {
    if (!wowDir || isLaunching) return;

    isLaunching = true;
    error = "";

    try {
      await invoke("launch_game", { folderPath: wowDir, version: selected?.key, game: "wow" });
    } catch (e: any) {
      error = e?.toString() || "Failed to launch WoW";
      console.error("Launch error:", e);
    } finally {
      isLaunching = false;
    }
  }

  onMount(async () => {
    unsubscribe = GameThemeStore.subscribe((themes) => {
      wowTheme = themes.find(t => t.game === 'wow');
    });

    try {
      // Load WoW directory
      wowDir = await invoke("locate_game", {game: "wow"});

      if (!wowDir) {
        const modal = document.getElementById("setDirectoryModal") as HTMLDialogElement;
        modal?.showModal();
      }

      // Sync WoW build info
      const res = await invoke<string>("sync_game_build", {game: "wow"});
      console.log("Sync result:", res);

      // Load versions from store
      const versions = await getFromStore("wow_versions");
      if (versions) {
        wowVersions = versions as Record<string, string>;
      }

      // Build dropdown items
      dropdownItems = Object.entries(wowVersions).map(([key, version]) => {
        if (key === "wow") return { key, label: "World of Warcraft" };
        if (key === "wowxptr" || key ==="wowt") return { key, label: `World of Warcraft: PTR` };
        if (key === "wow_classic_era") return { key, label: `World of Warcraft: Classic` };
        if (key === "wow_classic") return { key, label: `Mists of Pandaria Classic` };
        if (key === "wow_beta") return { key, label: `Midnight Beta` };
        return { key, label: key };
      });

      // Set default selection
      if (!selected && dropdownItems.length > 0) {
        selected = dropdownItems[0];
      }

      // Load playtime if tracking is enabled
      const trackPlaytime = await getFromStore('settings-trackWoWPlaytime');
      if (trackPlaytime) {
        playTime = await getWoWPlaytime();
      }
    } catch (err) {
      console.error("Initialization failed:", err);
      error = "Failed to load WoW. Please check your installation.";
    } finally {
      isLoading = false;
    }

    const newsPostsRes = await fetch(`${dev ? 'https://localhost:7176' : 'https://twistingnetherapi.furyshiftz.com'}/api/general/wow-news`);
    if (newsPostsRes.ok) {
      newsPosts = await newsPostsRes.json();
    }
    wowProfile = await invoke("fetch_wow_profile", {authToken : await getBattleNetToken()})
    console.log(wowProfile)
  });

  onDestroy(() => {
    clearInterval(interval);
    unsubscribe?.();
  });

  // Check if PTR or Classic is selected
  $effect(() => {
    ptrNotification = (selected?.key.toLowerCase().includes('ptr') || selected?.key.toLowerCase().includes('wowt')) ?? false;
    classicNotification = !!selected?.key?.toLowerCase().includes('classic') && selected?.key?.toLowerCase().includes('era');
  });

  // Computed values
  const buttonText = $derived(isLaunching ? 'Launching...' : 'PLAY');
  const currentVersion = $derived((selected?.key && wowVersions[selected.key]) ? wowVersions[selected.key] : 'Loading...');
  const playTimeHours = $derived(playTime > 0 ? parseFloat((playTime / 3600).toFixed(2)) : 0);
  
const getBattleNetToken = async() => await getFromStore('access_token');

 let selectedRealm = $state('all');
  let selectedAccount = $state(0);
  let sortBy = $state('name'); // name, level

  let accounts = $derived(wowProfile?.wow_accounts || []);
  let characters = $derived(accounts[selectedAccount]?.characters || []);
  let realms = $derived([...new Set(characters.map(c => c.realm?.name?.en_US).filter(Boolean))].sort());
  
  let filteredCharacters = $derived.by(() => {
    let filtered = characters.filter(char => {
      if (selectedRealm !== 'all' && char.realm?.name?.en_US !== selectedRealm) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'level') {
        return b.level - a.level; // descending
      }
      return a.name.localeCompare(b.name); // alpha
    });
  });
</script>

{#if error}
<div class="absolute top-4 left-4 w-fit max-w-md p-4 bg-red-900/90 text-white rounded-lg shadow-lg z-50 flex items-start gap-2">
  <p class="flex-1">{error}</p>
  <button class="cursor-pointer hover:opacity-70" onclick={() => error = ""}>
    <CircleX size="20" />
  </button>
</div>
{/if}

<dialog id="wowDirModal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">WoW Directory Not Found</h3>
    <p class="py-4">Please set your World of Warcraft installation directory.</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

<div class="flex flex-col justify-between h-[100vh] p-24 max-w-full">
  <div class="w-full h-30 2xl:h-40">
    {#if wowTheme}
    <GameLogoPanel 
      theme={wowTheme} 
      options={[
        { icon: Settings, label: "Options" }, 
        { icon: SquareCheckBig, label: "Redeem a Code" }
      ]}
      game='wow'
    />
    {/if}
  </div>
  
  <div class="flex flex-row gap-4 mt-20 2xl:mt-24 h-60 2xl:h-72 3xl:h-80">
    <!-- Main Video Section -->
    <div class="relative rounded-xl overflow-hidden w-md 2xl:w-xl shadow-lg">
      {#if wowTheme}
      <iframe 
        class="w-full h-full" 
        src={getLayoutConfig(GamePrefix.WoW, wowTheme.activePrefix)?.cinematicUrl}
        title="World of Warcraft Cinematic" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen
      ></iframe>
      {/if}
    </div>
    
    <!-- Right Column: Ads / Info -->
    <div class="flex flex-row gap-4 max-h-full">
      {#if newsPosts && newsPosts.length > 0}
        {#key index}
          <a 
            href={newsPosts[index].link}
            target="_blank"
            rel="noopener noreferrer"
            class="relative rounded-xl shadow-lg h-full overflow-hidden hover:shadow-xl transition-shadow block w-full"
          >
            <img 
              src={newsPosts[index].image}
              alt={newsPosts[index].title}
              class="w-64 h-[40%] object-cover cursor-pointer"
            />

            <div class="h-[60%] bg-[#292a33]/80 max-w-64 text-white p-3 text-sm" style="font-family: frizQuadrata;">
              <h2 class="2xl:text-lg font-semibold mb-2">
                {newsPosts[index].title}
              </h2>

              <p class="text-sm leading-relaxed">
                {newsPosts[index].subtitle}
              </p>
            </div>
          </a>
        {/key}
        {:else}
        <div class="relative rounded-xl shadow-lg h-full overflow-hidden hover:shadow-xl transition-shadow block">
            <div class="w-64 h-[40%] object-cover cursor-pointer bg-[#292a33]">
              <div class="w-full h-full bg-[#292a33] skeleton animate-pulse">
              </div>
            </div>

            <div class="h-[60%] bg-[#292a33] max-w-64 text-white p-3 text-sm" style="font-family: frizQuadrata;">
              <div class="2xl:text-lg font-semibold mb-2 bg-gray-500 h-6 skeleton animate-pulse">
              </div>

              <p class="text-sm leading-relaxed bg-gray-500 h-3 w-full skeleton animate-pulse">
              </p>
              <p class="text-sm leading-relaxed bg-gray-500 h-3 w-full mt-2 skeleton animate-pulse">
              </p>
              <p class="text-sm leading-relaxed bg-gray-500 h-3 w-2/3 mt-2 skeleton animate-pulse">
              </p>
            </div>
          </div>
      {/if}
    </div>
    <div class="flex-1 bg-[#1f1f2a] rounded-l-xl z-0 overflow-hidden flex flex-col " >
  {#if wowProfile}
    <div class="p-3 border-b border-gray-700 space-y-2">
      <div class="flex gap-2">
        {#if accounts.length > 1}
          <select bind:value={selectedAccount} class="flex-1 px-2 py-1 bg-[#2a2a3a] text-white text-sm rounded border border-gray-600">
            {#each accounts as account, i}
              <option value={i}>Account {i + 1}</option>
            {/each}
          </select>
        {/if}
        
        <select bind:value={selectedRealm} class="flex-1 px-2 py-1 bg-[#2a2a3a] text-white text-sm rounded border border-gray-600">
          <option value="all">All Realms</option>
          {#each realms as realm}
            <option value={realm}>{realm}</option>
          {/each}
        </select>
        
        <select bind:value={sortBy} class="px-2 py-1 bg-[#2a2a3a] text-white text-sm rounded border border-gray-600">
          <option value="name">A-Z</option>
          <option value="level">Level</option>
        </select>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto" style="font-family: frizQuadrata;">
      {#each filteredCharacters as character (character.id || character.name)}
        <div class="px-3 py-2 border-b border-gray-700 hover:bg-[#2a2a3a] cursor-pointer">
          <div class="flex justify-between items-center">
            <div>
              <span class="text-white font-medium text-sm">{character.name}</span>
              <span class="text-gray-400 text-xs ml-2">
                {character.level} {character.playable_class?.name?.en_US || ''}
              </span>
            </div>
            <span class="text-gray-500 text-xs">{character.realm?.name?.en_US || ''}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
  </div>
  <div class="flex flex-col items-start mb-8 mt-2 w-full">
    <div class="flex items-center gap-2 mb-2">
      <p class="text-gray-400 font-light text-sm uppercase tracking-wide">Version</p>
      
    </div>
    <div class="flex flex-row gap-x-2">
        <Dropdown 
          items={dropdownItems.map(i => i.label)} 
          selected={selected?.label || ''} 
          onSelect={(label) => {
            selected = dropdownItems.find(i => i.label === label) || null;
          }} 
        />
      {#if ptrNotification}
      <div class="relative group">
        <InfoIcon size="16" class="text-red-500 hover:text-red-400 transition-colors" />
        <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg">
          PTR will not launch as a result of Blizzard's limitations with launcher codes.
          <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
      {/if}
      {#if classicNotification}
      <div class="relative group">
        <InfoIcon size="16" class="text-blue-400 hover:text-blue-300 transition-colors" />
        <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg">
          This will only launch Mists of Pandaria Classic as a result of Blizzard's limitations with launcher codes.
          <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
      {/if}
    </div>
   

    <div class="flex flex-row items-end justify-between w-full mt-2">
      <div class="flex flex-row items-end gap-x-4">
        <button 
          onclick={launch_wow} 
          disabled={ptrNotification || isLaunching || isLoading || !wowDir} 
          class="disabled:bg-gray-600 disabled:text-gray-400 relative w-64 px-12 py-6 text-4xl font-bold disabled:cursor-not-allowed enabled:cursor-pointer enabled:text-white rounded-lg enabled:bg-gradient-to-b from-[#4aa1f3] to-[#0077c9] shadow-lg shadow-black/50 transform transition duration-150 ease-in-out enabled:hover:scale-105 enabled:hover:shadow-xl enabled:active:scale-95 active:shadow-md before:absolute before:inset-0 before:rounded-lg enabled:before:bg-white enabled:before:opacity-0 enabled:before:pointer-events-none enabled:hover:before:opacity-10"
          aria-label={buttonText}
        >
          <span class="relative z-10">{buttonText}</span>
        </button>
        
        <div class="text-gray-400 text-sm space-y-1">
          {#if playTimeHours > 0}
          <p>{playTimeHours} Hours Played</p>
          {/if}
          <p>
            Version {currentVersion} | 
            <a 
              href="https://worldofwarcraft.blizzard.com/en-us/content-update-notes" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Patch Notes
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none bg-gradient-to-t from-black/100 via-black/75 to-transparent -z-10"></div>