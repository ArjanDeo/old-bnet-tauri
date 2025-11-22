<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { CircleX, Settings, SquareCheckBig } from 'lucide-svelte';
  import GameLogoPanel from "../../../components/GameLogoPanel.svelte";
  import Dropdown from "../../../components/dropdown.svelte";
  import { GamePrefix, getLayoutConfig, type GameTheme, type OverwatchNewsPost } from "../../../data";
  import { GameThemeStore, getFromStore } from "../../../stores";
  import { onMount, onDestroy } from "svelte";
    import { dev } from "$app/environment";

  type VersionItem = { key: string; label: string; };

  let dropdownItems: VersionItem[] = $state([]);
  let selected = $state<VersionItem | null>(null);
  let owDir = $state("");
  let owTheme = $state<GameTheme>();
  let error = $state("");
  let owVersions: Record<string, string> = $state({});
  let isLaunching = $state(false);
  let isLoading = $state(true);
  let newsPosts: Array<OverwatchNewsPost> | undefined = $state();
  let index = $state(0);
  const INTERVAL = 5000; // 5 seconds

  // Rotate automatically
  const interval = setInterval(() => {
    if (newsPosts && newsPosts.length > 0) {
      index = (index + 1) % newsPosts.length;
    }
  }, INTERVAL);
  let unsubscribe: (() => void) | null = null;

  async function launch_ow() {
    if (!owDir || isLaunching) return;

    isLaunching = true;
    error = "";

    try {
      await invoke("launch_game", { folderPath: owDir, game: "ow" });
    } catch (e: any) {
      error = e?.toString() || "Failed to launch Overwatch";
      console.error("Launch error:", e);
    } finally {
      isLaunching = false;
    }
  }

  onMount(async () => {
    unsubscribe = GameThemeStore.subscribe((themes) => {
      owTheme = themes.find(t => t.game === 'ow');
    });

    try {
      // Load OW directory
      owDir = await invoke("locate_game", { game: "ow" });

      if (!owDir) {
        error = "Overwatch installation not found. Please check your installation.";
      }

      // Sync OW build info
      const res = await invoke<string>("sync_game_build", { game: "ow" });
      console.log("Sync result:", res);

      // Load versions from store
      const versions = await getFromStore("ow_versions");
      if (versions) {
        owVersions = versions as Record<string, string>;
      }

      // Build dropdown items (OW typically only has one version)
      dropdownItems = Object.entries(owVersions).map(([key, version]) => {
        return { key, label: `Overwatch 2` };
      });

      // Set default selection
      if (!selected && dropdownItems.length > 0) {
        selected = dropdownItems[0];
      }
    } catch (err) {
      console.error("Initialization failed:", err);
      error = "Failed to load Overwatch. Please check your installation.";
    } finally {
      isLoading = false;
    }
    const newsPostsRes = await fetch(`${dev ? 'https://localhost:7176' : 'https://twistingnetherapi.furyshiftz.com'}/api/general/overwatch-news`);
    if (newsPostsRes.ok) {
      newsPosts = await newsPostsRes.json();
    }
  });

  onDestroy(() => {
    clearInterval(interval);
    unsubscribe?.();
  });

  // Computed values
  const buttonText = $derived(isLaunching ? 'Launching...' : 'PLAY');
  const currentVersion = $derived((selected?.key && owVersions[selected.key]) ? owVersions[selected.key] : 'Loading...');
</script>

{#if error}
<div class="absolute top-4 left-4 w-fit max-w-md p-4 bg-red-900/90 text-white rounded-lg shadow-lg z-50 flex items-start gap-2">
  <p class="flex-1">{error}</p>
  <button class="cursor-pointer hover:opacity-70" onclick={() => error = ""}>
    <CircleX size="20" />
  </button>
</div>
{/if}

<div class="flex flex-col justify-between h-[100vh] p-24">
  <div class="w-full h-30 2xl:h-40">
    {#if owTheme}
    <GameLogoPanel 
      theme={owTheme} 
      options={[
        { icon: Settings, label: "Options" }, 
        { icon: SquareCheckBig, label: "Redeem a Code" }
      ]}
      game='ow'
    />
    {/if}
  </div>
  
  <div class="flex flex-row gap-4 mt-20 2xl:mt-24 h-60 2xl:h-72 3xl:h-80">
    <!-- Main Video Section -->
    <div class="relative flex-1 rounded-xl overflow-hidden w-md 2xl:w-lg shadow-lg">
      {#if owTheme}
      <iframe 
        class="w-full h-full" 
        src={getLayoutConfig(GamePrefix.OW, owTheme.activePrefix)?.cinematicUrl}
        title="Overwatch Cinematic" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen
      ></iframe>
      {/if}
    </div>
    
    <!-- Right Column: Ads / Info -->
    <div class="flex flex-row gap-4 w-80 max-h-full">
      {#if newsPosts && newsPosts.length > 0}
        {#key index}
          <a 
            href={newsPosts[index].link}
            target="_blank"
            rel="noopener noreferrer"
            class="relative rounded-xl shadow-lg h-full overflow-hidden hover:shadow-xl transition-shadow block"
          >
            <img 
              src={newsPosts[index].image}
              alt={newsPosts[index].title}
              class="w-64 h-[40%] object-cover cursor-pointer"
            />

            <div class="h-[60%] bg-[#292a33]/80 max-w-64 text-white p-3 text-sm">
              <h2 class="2xl:text-lg font-semibold mb-2">
                {newsPosts[index].title}
              </h2>
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
    </div>

    <div class="flex flex-row items-end justify-between w-full mt-2">
      <div class="flex flex-row items-end gap-x-4">
        <button 
          onclick={launch_ow} 
          disabled={isLaunching || isLoading || !owDir} 
          class="disabled:bg-gray-600 disabled:text-gray-400 relative w-64 px-12 py-6 text-4xl font-bold disabled:cursor-not-allowed enabled:cursor-pointer enabled:text-white rounded-lg enabled:bg-gradient-to-b from-[#4aa1f3] to-[#0077c9] shadow-lg shadow-black/50 transform transition duration-150 ease-in-out enabled:hover:scale-105 enabled:hover:shadow-xl active:scale-95 active:shadow-md before:absolute before:inset-0 before:rounded-lg enabled:before:bg-white enabled:before:opacity-0 enabled:before:pointer-events-none enabled:hover:before:opacity-10"
          aria-label={buttonText}
        >
          <span class="relative z-10">{buttonText}</span>
        </button>
        
        <div class="text-gray-400 text-sm space-y-1">
          <p>
            Version {currentVersion} | 
            <a 
              href="https://overwatch.blizzard.com/en-us/news/patch-notes/" 
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