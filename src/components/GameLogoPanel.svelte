<script lang="ts">
  import type { Settings } from "lucide-svelte";
  import { ExpansionPrefix, getLayoutConfig } from "../data";
  
  let { layout, options = [] }: { 
    layout: ExpansionPrefix;
    options?: { icon: typeof Settings, label: string }[];
  } = $props();
  
  let config = $derived(getLayoutConfig(layout));
  
  // Size mappings for consistent dimensions
  const sizeClasses = {
    small: 'h-32',    // ~128px
    medium: '2xl:h-40 h-30',   // ~160px
    large: 'h-48',    // ~192px
    xlarge: 'h-56'    // ~224px
  };
</script>

<div class="flex flex-col items-center w-fit">
  <!-- Fixed height container with object-fit to prevent layout shifts -->
  <div class="flex items-center justify-center {sizeClasses[config.logoSize]}">
    <img 
      src="images/{layout}_logo.png" 
      alt="{layout} Logo" 
      class="max-h-full w-auto object-contain"
    />
  </div>
  
  <div class="flex flex-row gap-x-5 text-white mt-6 bg-black/25 py-0.5 px-1 rounded">
    {#each options as option}
      <div class="flex flex-row gap-x-0.5 items-center">
        <option.icon size="18" color="#076485"/>
        <p>{option.label}</p>
      </div>
    {/each}
  </div>
</div>