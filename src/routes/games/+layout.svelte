<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import GameButton from "../../components/GameButton.svelte";
  import { GameThemeStore } from "../../stores";
  import { GamePrefix, type GameTheme } from "../../data";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let selectedGame = $state<GamePrefix | undefined>();
  let currentTheme: GameTheme | undefined = $state();

  // update selected game based on URL
$effect(() => {
  switch (page.url.pathname) {
    case "/games/wow":
      selectedGame = GamePrefix.WoW
      break;
    case "/games/ow":
      selectedGame = GamePrefix.OW
      break;
  }
  currentTheme = $GameThemeStore.find(t => t.game === selectedGame);
});
  // subscribe once and reactively filter
  const unsubscribe = GameThemeStore.subscribe((themes) => {
    if (selectedGame) {
      currentTheme = themes.find((t) => t.game === selectedGame);
    }
  });

  onDestroy(unsubscribe);
</script>

<div class="select-none fixed w-full flex flex-col">
  <div class="fixed inset-0 overflow-hidden">
    {#if selectedGame && currentTheme}
      <img
        src={`/images/${selectedGame}/${selectedGame}_${currentTheme.activePrefix}_key_art.jpg`}
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
      <div class="w-1/12 bg-clip-padding bg-black/50 rounded-sm flex flex-col p-2 gap-y-2">
        <GameButton icon="/images/wow/wow_wow.png" onClick={() => goto("/games/wow")} text="World of Warcraft" selected={selectedGame == "wow"} />
        <GameButton icon="/images/sc2.png" onClick={() => goto("/games/sc2")} text="Starcraft II" selected={selectedGame == "sc2"} />
        <GameButton icon="/images/d3.png" onClick={() => goto("/games/d3")} text="Diablo III" selected={selectedGame == "d3"} />
        <GameButton icon="/images/hs.png" onClick={() => goto("/games/hs")} text="Hearthstone" selected={selectedGame == "hs"} />
        <GameButton icon="/images/hots.png" onClick={() => goto("/games/hots")} text="Heroes of the Storm" selected={selectedGame == "hots"} />
        <GameButton icon="/images/ow/ow.png" onClick={() => goto("/games/ow")} text="Overwatch" selected={selectedGame == "ow"} />
      </div>

      <div class="flex-1 flex flex-col items-start justify-start min-h-0">
        {@render children()}
      </div>
    </div>
  </div>
</div>
