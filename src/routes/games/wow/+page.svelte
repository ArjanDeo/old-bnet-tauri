<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { CircleX, Settings, SquareCheckBig } from 'lucide-svelte';
  import GameLogoPanel from "../../../components/GameLogoPanel.svelte";
  import Dropdown from "../../../components/dropdown.svelte";
  import { GamePrefix, WoWExpansionPrefix, getLayoutConfig, getWoWPlaytime, type GameTheme } from "../../../data";
  import { GameThemeStore, getFromStore } from "../../../stores";
  import { onMount, onDestroy } from "svelte";

  type VersionItem = { key: string; label: string; };

  let dropdownItems: VersionItem[] = $state([]);
  let selected = $state<VersionItem | null>(null);
  let wowDir = $state("");
  let wowTheme = $state<GameTheme>();
  let error = $state("");
  let wowVersions: Record<string, string> = $state({});
  let ptrNotification = $state(false);
  let playTime = $state(0);
  let isLaunching = $state(false);
  let isLoading = $state(true);

  let unsubscribe: (() => void) | null = null;

  async function launch_wow() {
    if (!wowDir || isLaunching) return;

    isLaunching = true;
    error = "";

    try {
      await invoke("launch_wow", { folderPath: wowDir, version: selected?.key });
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
      wowDir = await invoke("locate_wow");

      if (!wowDir) {
        const modal = document.getElementById("setDirectoryModal") as HTMLDialogElement;
        modal?.showModal();
      }

      // Sync WoW build info
      const res = await invoke<string>("sync_wow_build");
      console.log("Sync result:", res);

      // Load versions from store
      const versions = await getFromStore("wow_versions");
      if (versions) {
        wowVersions = versions as Record<string, string>;
      }

      // Build dropdown items
      dropdownItems = Object.entries(wowVersions).map(([key, version]) => {
        if (key === "wow") return { key, label: "World of Warcraft" };
        if (key === "wowxptr") return { key, label: `PTR (${version})` };
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
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  // Check if PTR is selected
  $effect(() => {
    ptrNotification = selected?.key.toLowerCase().includes('ptr') ?? false;
  });

  // Computed values
  const buttonText = $derived(isLaunching ? 'Launching...' : 'PLAY');
  const currentVersion = $derived((selected?.key && wowVersions[selected.key]) ? wowVersions[selected.key] : 'Loading...');
  const playTimeHours = $derived(playTime > 0 ? Math.round(playTime / 3600) : 0);
</script>

{#if error}
<div class="absolute top-4 left-4 w-fit max-w-md p-4 bg-red-900/90 text-white rounded-lg shadow-lg z-50 flex items-start gap-2">
  <p class="flex-1">{error}</p>
  <button class="cursor-pointer hover:opacity-70" onclick={() => error = ""}>
    <CircleX size="20" />
  </button>
</div>
{/if}

{#if ptrNotification}
<div class="absolute w-96 m-2 text-wrap p-4 rounded-xl top-0 right-0 bg-slate-800 shadow-lg flex flex-row gap-2 items-start z-50">
  <p class="text-red-400 flex-1 text-sm">
    PTR will not launch (look at lib.rs's launch_wow() function on GitHub for details)
  </p>
  <button class="cursor-pointer hover:opacity-70 flex-shrink-0" onclick={() => ptrNotification = false}>
    <CircleX size="18" color="grey"/>
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

<div class="flex flex-col justify-between h-[100vh] p-20">
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
  
  <div class="flex flex-row gap-4 mt-20 2xl:mt-24 h-72 3xl:h-80">
    <!-- Main Video Section -->
    <div class="relative flex-1 rounded-xl overflow-hidden w-lg shadow-lg">
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
    <div class="flex flex-row gap-4 w-80 max-h-full">
      <a 
        href="https://worldofwarcraft.com" 
        target="_blank" 
        rel="noopener noreferrer"
        class="relative rounded-xl shadow-lg h-full overflow-hidden hover:shadow-xl transition-shadow"
      >
        <img 
          src="../images/wow/wow_leg_remix_art.webp" 
          alt="Legion Remix: Rise of the Nightfallen" 
          class="w-64 h-[40%] object-cover cursor-pointer"
        />
        <div class="h-[60%] bg-[#292a33]/80 max-w-64 text-white p-3 text-sm" style="font-family: frizQuadrata;">
          <h2 class="2xl:text-lg font-semibold mb-2">
            Legion Remix: Rise of the Nightfallen Now Live!
          </h2>
          <p class="text-sm leading-relaxed">
            Continue the Nightfallen's story with the Insurrection campaign and new World Quests across the Broken Isles. Re-experience the Legion mega-dungeon with the Return to Karazhan, and take on the Nighthold raid.
          </p>
        </div>
      </a>
    </div>
  </div>
  
  <div class="flex flex-col items-start mb-8 mt-2 w-full">
    <p class="text-gray-400 font-light mb-2 text-sm uppercase tracking-wide">Version</p>
    <Dropdown 
      items={dropdownItems.map(i => i.label)} 
      selected={selected?.label || ''} 
      onSelect={(label) => {
        selected = dropdownItems.find(i => i.label === label) || null;
      }} 
    />

    <div class="flex flex-row items-end justify-between w-full mt-4">
      <div class="flex flex-row items-end gap-x-4">
        <button 
          onclick={launch_wow} 
          disabled={ptrNotification || isLaunching || isLoading || !wowDir} 
          class="disabled:bg-gray-600 disabled:text-gray-400 relative w-64 px-12 py-6 text-4xl font-bold disabled:cursor-not-allowed enabled:cursor-pointer enabled:text-white rounded-lg enabled:bg-gradient-to-b from-[#4aa1f3] to-[#0077c9] shadow-lg shadow-black/50 transform transition duration-150 ease-in-out enabled:hover:scale-105 enabled:hover:shadow-xl active:scale-95 active:shadow-md before:absolute before:inset-0 before:rounded-lg enabled:before:bg-white enabled:before:opacity-0 enabled:before:pointer-events-none enabled:hover:before:opacity-10"
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
              class="text-blue-500 hover:text-blue-400 transition-colors underline"
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