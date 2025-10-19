<script lang="ts">
  import { type Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import "../app.css";
  import NavLink from '../components/NavLink.svelte';
  import GameButton from '../components/GameButton.svelte';
  import { ExpansionPrefix, getLayoutConfig } from '../data';
  import Dropdown from '../components/dropdown.svelte';
  import { launcherStyle } from '../stores';
  
  let { data, children }: { data: LayoutData, children: Snippet } = $props();
  
  let layout = $state<ExpansionPrefix>(ExpansionPrefix.Midnight);
  let selectedLink = $state<'GAMES' | 'SHOP' | 'NEWS'>('GAMES');
  
  let config = $derived(getLayoutConfig(layout));
  
  // Load saved style on mount
  $effect(() => {
    const unsubscribe = launcherStyle.subscribe((val) => {
      layout = val;
    });
    return unsubscribe;
  });
  
  function selectStyle(xpac: ExpansionPrefix) {
    launcherStyle.set(xpac);
  }
</script>

<div class="select-none fixed w-full h-screen flex flex-col">
  <!-- Background with normalized sizing -->
  <div class="fixed inset-0 overflow-hidden">
    <img 
      src="/images/{layout}_key_art.jpg" 
      alt="Background" 
      class="w-full h-full object-cover {config.transform}"
      style="object-position: {config.bgFocalPoint};"
    />
    <div class="absolute inset-0 bg-black/20"></div>
    <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
  </div>
  
  <!-- Foreground content -->
  <div class="relative z-10 flex flex-col w-full h-screen">
    <!-- Top Navbar -->
    <nav class="rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 p-6 flex flex-row gap-x-10 flex-none">
      <img src="/images/battle_net_logo.png" alt="battle.net logo" class="w-14 h-14 my-auto mr-6"/>
      <NavLink text="GAMES" selected={selectedLink=='GAMES'} onClick={() => selectedLink='GAMES'}/>
      <NavLink text="SHOP" selected={selectedLink=='SHOP'} onClick={() => selectedLink='SHOP'}/>
      <NavLink text="NEWS" selected={selectedLink=='NEWS'} onClick={() => selectedLink='NEWS'}/>
    </nav>
    
    <Dropdown
      items={Object.values(ExpansionPrefix)}
      selected={layout}
      onSelect={(xpac: ExpansionPrefix) => selectStyle(xpac)}
    />
    
    <!-- Below navbar -->
    <div class="flex flex-1 min-h-0">
      <!-- Sidebar stretches top-to-bottom -->
      <div class="w-1/12 bg-clip-padding bg-black/50 rounded-sm flex flex-col p-2 gap-y-2">
        <GameButton icon="/images/wow_logo.png" onClick={() => console.log('WoW Clicked!')} text="World of Warcraft" selected={true}/>
        <GameButton icon="/images/sc2.png" onClick={() => console.log('SC2 Clicked!')} text="Starcraft II" selected={false}/>
        <GameButton icon="/images/d3.png" onClick={() => console.log('SC2 Clicked!')} text="Diablo III" selected={false}/>
        <GameButton icon="/images/hs.png" onClick={() => console.log('Hearthstone Clicked!')} text="Hearthstone" selected={false}/>
        <GameButton icon="/images/hots.png" onClick={() => console.log('HotS Clicked!')} text="Heroes of the Storm" selected={false}/>
        <GameButton icon="/images/ow.png" onClick={() => console.log('OW Clicked!')} text="Overwatch" selected={false}/>
      </div>
      
      <!-- Main content -->
      <div class="flex-1 flex flex-col items-start justify-start min-h-0">
        {@render children()}
      </div>
    </div>
  </div>
</div>