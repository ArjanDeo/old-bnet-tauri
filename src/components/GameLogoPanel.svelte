<script lang="ts">
  import type { Settings } from "lucide-svelte";
  import { GamePrefix, getLayoutConfig, type GameTheme } from "../data";
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
  let { theme, options = [], game }: { 
    theme: GameTheme;
    options?: { icon: typeof Settings, label: string }[];
    game: 'wow' | 'sc2' | 'd3' | 'hs' | 'hots' | 'ow';
  } = $props();
  // Get current layout config based on the active prefix
  let config = getLayoutConfig(game as GamePrefix, theme.activePrefix);
  // Size mappings for responsive logo dimensions
  const sizeClasses = {
    small: 'h-32 xl:h-36 2xl:h-40',
    medium: 'h-36 xl:h-44 2xl:h-52',
    large: 'h-44 xl:h-52 2xl:h-60',
    xlarge: 'h-52 xl:h-60 2xl:h-72'
  };
</script>
<div class="flex flex-col items-center w-fit max-h-72">
  <div class="h-40 xl:h-60 2xl:h-72 flex items-center justify-center">
    <div class="{sizeClasses[config?.logoSize!]} flex items-center justify-center">
      <img 
        src="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/{game}/{game}_{theme.activePrefix}_logo.webp" 
        alt="{game} {theme.activePrefix} logo" 
        class="max-h-full w-auto object-contain"
      />
    </div>
  </div>
  <div class="flex flex-row gap-x-3 xl:gap-x-4 2xl:gap-x-5 text-white text-sm xl:text-base bg-black/25 py-0.5 px-1 rounded min-w-[280px] xl:min-w-[320px] 2xl:min-w-[350px] justify-center">
    {#each options as option}
      <div class="flex flex-row gap-x-0.5 items-center">
        <option.icon size="18" color="#076485"/>
        <p>{option.label}</p>
      </div>
    {/each}
  </div>
</div>