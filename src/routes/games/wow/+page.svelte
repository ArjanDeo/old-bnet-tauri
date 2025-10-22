<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { CircleX, Settings, SquareCheckBig } from 'lucide-svelte';
  import GameLogoPanel from "../../../components/GameLogoPanel.svelte";
  import Dropdown from "../../../components/dropdown.svelte";
  import { GamePrefix, WoWExpansionPrefix, getLayoutConfig, type GameTheme } from "../../../data";
  import { GameThemeStore } from "../../../stores";
  import { onMount } from "svelte";
  import { load } from "@tauri-apps/plugin-store";
  type VersionItem = { key: string; label: string; };

  let dropdownItems: VersionItem[] = $state([]);
  let selected: VersionItem | null = $state(null);
  let wowDir = $state("");
  let wowTheme = $state<GameTheme>();
  let error = $state("");
  let wowVersions: Record<string, string> = $state({});
  let ptrNotification: boolean = $state(false);
  
  async function launch_wow() {
    if (!wowDir) return;
    try {
        const result = await invoke("launch_wow", { folderPath: wowDir, version:selected?.key });
        console.log(result);
    } catch (e: any) {
      error = e;
    }
}

onMount(async () => {
  const unsubscribe = GameThemeStore.subscribe((themes) => {
    wowTheme = themes.find(t => t.game === 'wow');
  });

  try {
    wowDir = await invoke("locate_wow");

    if (!wowDir) {
      const modal = document.getElementById("setDirectoryModal") as HTMLDialogElement;
      modal.showModal();
    }

    const res = await invoke<string>("sync_wow_build");
    console.log(res);

    const store = await load("store.json");
    const versions = await store.get("wow_versions");

    if (versions) {
      wowVersions = versions as Record<string, string>;
    }

    dropdownItems = Object.entries(wowVersions).map(([key, version]) => {
      if (key === "wow") return { key, label: "World of Warcraft" };
      if (key === "wowxptr") return { key, label: `PTR (${version})` };
      return { key, label: key };
    });

    if (!selected && dropdownItems.length > 0) {
      selected = dropdownItems[0];
    }
  } catch (err) {
    console.error("Sync failed:", err);
    error = "Failed to load WoW versions";
  }
});

function setActiveWoWTheme(expansion: WoWExpansionPrefix) {
  GameThemeStore.update(themes =>
    themes.map(t =>
      t.game === 'wow'
        ? { ...t, activePrefix: expansion }
        : t
    )
  );
}

$effect(() => {
ptrNotification = (selected?.key.toLowerCase().includes('ptr') ?? false);
});

</script>
{#if error != ""} 
<div class="absolute w-fit p-2 bg-slate-800">
  <p>{error}</p>
</div>
{/if}
{#if ptrNotification}
<div class="absolute w-fit p-2 rounded-xl bottom-36 bg-slate-800 ml-80 flex flex-row gap-x-1">
  <p class="text-red-500">
    PTR will not launch (look at lib.rs's launch_wow() function on github for details)
  </p>
  <button class="cursor-pointer" onclick={() => ptrNotification = false}>
    <CircleX size="18" color="grey"/>
  </button>
</div>
{/if}
<dialog id="wowDirModal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">Press ESC key or click the button below to close</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
<div class="flex flex-col justify-between h-[100vh] p-20 ">
  <div class=" max-h-24 2xl:max-h-30">
    {#if wowTheme}
    <GameLogoPanel 
      theme={wowTheme} 
      options={[
        { icon: Settings, label: "Options" }, 
        { icon: SquareCheckBig, label: "Redeem a Code" }
      ]}
      game = 'wow'
    />
    {/if}
  </div>
  
  <div class="flex flex-row gap-4 mt-20 2xl:mt-24 h-64 3xl:h-80">
    <!-- Main Video Section -->
    <div class="relative flex-1 rounded-xl overflow-hidden shadow-lg">
      {#if wowTheme}
      <iframe 
        class="w-lg h-full" 
        src={getLayoutConfig(GamePrefix.WoW, wowTheme.activePrefix)?.cinematicUrl}
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen
      ></iframe>
      {/if}
    </div>
    
    <!-- Right Column: Ads / Info -->
    <div class="flex flex-row gap-4 w-80 max-h-full">
      <!-- Advertisement / Event Image -->
      <a href="https://worldofwarcraft.com" target="_blank" class="relative rounded-xl shadow-lg h-full">
        <img src="../images/wow/wow_leg_remix_art.png" alt="Ad" class="w-64 h-[40%] object-cover  cursor-pointer"/>
        <div class="h-[60%] bg-[#292a33]/80 max-w-64 text-white p-1 text-sm overflow-clip" style="font-family: frizQuadrata;">
          <h1 class="2xl:text-lg font-semibold mb-2">Legion Remix: Skies of Fire Now Live!</h1>
          <p class="text-sm ">
            Get ready for fast frenetic fun in Legion Remix as you meet up with the infinite dragonflight once more, level new characters, and earn a variety of items to add to your collection.
          </p>
        </div>
      </a>
    </div>
  </div>
  
  <div class="flex flex-col items-start mb-8 mt-2 w-full">
    <p class="text-gray-400 font-light mb-2">REGION / ACCOUNT</p>
    <Dropdown 
      items={dropdownItems.map(i => i.label)} 
      selected={selected?.label || ''} 
      onSelect={(label) => {
        selected = dropdownItems.find(i => i.label === label) || null;
      }} 
    />

   
    <div class="flex flex-row items-end justify-between w-full mt-2">
      <div class="flex flex-row items-end gap-x-4">
        <button onclick={async () => launch_wow()} class=" relative w-64 px-12 py-6 text-4xl cursor-pointer text-white rounded-lg bg-gradient-to-b from-[#4aa1f3] to-[#0077c9] shadow-lg shadow-black/50 transform transition duration-150 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 active:shadow-md before:absolute before:inset-0 before:rounded-lg before:bg-white before:opacity-0 before:pointer-events-none hover:before:opacity-10">
          <span class="relative z-10">PLAY</span>
        </button>
        <span class="text-gray-400 text-sm">
          Version {selected != null ? wowVersions[selected.key] : ''} | View the
          <a href="https://twistingnether.furyshiftz.com/" target="_blank" class="text-blue-500"> Patch Notes</a>.
        </span>
      </div>
    </div>
  </div>
</div>
<div class="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none bg-gradient-to-t from-black/100 via-black/75 to-transparent -z-10"></div>
