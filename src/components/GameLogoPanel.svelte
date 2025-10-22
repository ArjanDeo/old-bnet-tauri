<script lang="ts">
  import type { Settings } from "lucide-svelte";
  import { GamePrefix, getLayoutConfig, type GameTheme } from "../data";
  
  let { theme, options = [], game }: { 
    theme: GameTheme;
    options?: { icon: typeof Settings, label: string }[];
    game: 'wow' | 'sc2' | 'd3' | 'hs' | 'hots' | 'ow';
  } = $props();

  // Get current layout config based on the active prefix
  let config = getLayoutConfig(game as GamePrefix, theme.activePrefix);

  // Size mappings for consistent logo dimensions
  const sizeClasses = {
    small: 'h-32',          // ~128px
    medium: '2xl:h-40 h-30', // ~160px
    large: 'h-48',          // ~192px
    xlarge: 'h-56'          // ~224px
  };
</script>

<div class="flex flex-col items-center w-fit">
  <!-- Logo container -->
  <div class="flex items-center justify-center {sizeClasses[config?.logoSize!]}">
    <img 
      src="../images/{game}/{game}_{theme.activePrefix}_logo.png" 
      alt="{game} Logo" 
      class="max-h-full w-auto object-contain"
    />
  </div>

  <!-- Options row -->
  <div class="flex flex-row gap-x-5 text-white mt-6 bg-black/25 py-0.5 px-1 rounded">
    {#each options as option}
      <div class="flex flex-row gap-x-0.5 items-center">
        <option.icon size="18" color="#076485"/>
        <p>{option.label}</p>
      </div>
    {/each}
  </div>
</div>
