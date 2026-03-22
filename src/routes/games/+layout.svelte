<script lang="ts">
  import { onMount, onDestroy, type Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import GameButton from "../../components/GameButton.svelte";
  import { GameThemeStore, getFromStore } from "../../stores";
  import { GamePrefix, type GameTheme } from "../../data";
    import { dev } from "$app/environment";
import { getCurrentWindow  } from "@tauri-apps/api/window";
  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let selectedGame = $state<GamePrefix | undefined>();
  let playMusic = $state<boolean>(false);
  let audio: HTMLAudioElement | null = $state(null);

  const pathToGame: Record<string, GamePrefix> = {
    "/games/wow": GamePrefix.WoW,
    "/games/ow": GamePrefix.OW,
    "/games/d3": GamePrefix.D3,
    "/games/hots": GamePrefix.HOTS,
    "/games/hs": GamePrefix.HS,
    "/games/sc2": GamePrefix.SC2,
  };

  // Derived theme from store
  let currentTheme = $derived.by(() =>
    $GameThemeStore.find((t) => t.game === selectedGame)
  );

  onMount(async () => {
    currentTheme = await getFromStore('game-theme')
    playMusic = (await getFromStore("settings-playMusic")) as boolean;
    if (playMusic && selectedGame && currentTheme) {
      playGameTheme();
    }
  });
  // Update selected game reactively based on route
  $effect(() => {
    if (typeof window === "undefined") return;

    selectedGame = pathToGame[page.url.pathname];
    // Play theme only if conditions are valid and a different track isn’t already playing
    if (
      playMusic &&
      selectedGame &&
      currentTheme &&
      (!audio ||
        audio.paused ||
        !audio.src.includes(`${selectedGame}_${currentTheme.activePrefix}`))
    ) {
      playGameTheme();
    }
     const pauseOnBlur = () => {
    if (audio instanceof Audio) audio.pause();
  };

  // Optional: resume when focused again
  const resumeOnFocus = () => {
    if (playMusic && audio instanceof Audio && audio.paused) {
      audio.play().catch(() => {});
    }
  };

  const unlistenBlur = getCurrentWindow().listen("tauri://blur", pauseOnBlur);
  const unlistenFocus = getCurrentWindow().listen("tauri://focus", resumeOnFocus);

  // Cleanup when reactive dependencies change or component unmounts
  return () => {
    unlistenBlur.then((fn) => fn());
    unlistenFocus.then((fn) => fn());
  };
  });


  onDestroy(() => {
    if (audio instanceof Audio) {
      audio.pause();
      audio.src = "";
      audio = null;
    }
  });

  function playGameTheme() {
    if (!selectedGame || !currentTheme) return;

    // Release old audio first
    if (audio instanceof Audio) {
      audio.pause();
      audio.src = "";
    }

    const newAudio = new Audio(
      `${dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/music/${selectedGame}_${currentTheme.activePrefix}_theme.mp3`
    );

    newAudio.volume = 0.1;
    newAudio.loop = true;
    newAudio.play().catch(console.error);

    audio = newAudio;
  }
</script>


<div class="select-none fixed w-full flex flex-col">
  <div class="fixed inset-0 overflow-hidden">
    {#if selectedGame && currentTheme}
      <img
        src={`${dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/${selectedGame}/${selectedGame}_${currentTheme.activePrefix}_key_art.webp`}
        alt="Background"
        class="w-full h-full object-cover {currentTheme.config[currentTheme.activePrefix].transform}"
        style="object-position: {currentTheme.config[currentTheme.activePrefix].bgFocalPoint};"
      />
    {/if}
    <div class="absolute inset-0 bg-black/20"></div>
    <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
  </div>

  <div class="relative z-10 flex flex-col w-full">
    <div class="flex flex-1 min-h-0">
      <div class="w-fit bg-clip-padding bg-black/50 rounded-sm flex flex-col p-2">
        <div class="mt-2">
          <GameButton icon="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/wow/wow_wow.webp" onClick={() => goto("/games/wow")} text="World of Warcraft" selected={selectedGame == "wow"} />
        </div>
        <GameButton icon="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/sc2.webp" onClick={() => goto("/games/sc2")} text="Starcraft II" selected={selectedGame == "sc2"} />
        <GameButton icon="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/d3.webp" onClick={() => goto("/games/d3")} text="Diablo III" selected={selectedGame == "d3"} />
        <GameButton icon="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/hs.webp" onClick={() => goto("/games/hs")} text="Hearthstone" selected={selectedGame == "hs"} />
        <GameButton icon="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/hots.webp" onClick={() => goto("/games/hots")} text="Heroes of the Storm" selected={selectedGame == "hots"} />
        <GameButton icon="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/ow/ow.webp" onClick={() => goto("/games/ow")} text="Overwatch" selected={selectedGame == "ow"} />
      </div>
<div class="flex-1 flex flex-col min-h-0 max-w-[calc(100%-320px)] pr-8">
  {@render children()}
</div>
    </div>
  </div>
</div>
