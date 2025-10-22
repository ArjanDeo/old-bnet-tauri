<script lang="ts">
    import { onMount } from 'svelte';
    import { GamePrefix, getLayoutConfig, type GameTheme } from '../../../data';
    import type { PageData } from './$types';
    import { GameThemeStore } from '../../../stores';
    import GameLogoPanel from '../../../components/GameLogoPanel.svelte';
    import { Settings, SquareCheckBig } from 'lucide-svelte';
    import Dropdown from '../../../components/dropdown.svelte';

    let { data }: { data: PageData } = $props();
  let owTheme = $state<GameTheme>();
    onMount(() => {
        const unsubscribe = GameThemeStore.subscribe((themes) => {
            owTheme = themes.find(t => t.game === 'ow');
        });
    })

</script>
<div class="flex flex-col justify-between h-[100vh] p-20 ">
  <div class=" max-h-24 2xl:max-h-30">
    {#if owTheme}
    <GameLogoPanel 
      theme={owTheme} 
      options={[
        { icon: Settings, label: "Options" }, 
        { icon: SquareCheckBig, label: "Redeem a Code" }
      ]}
      game = 'ow'
    />
    {/if}
  </div>

  <div class="flex flex-row gap-4 mt-20 2xl:mt-24 h-64 3xl:h-80">
    <!-- Main Video Section -->
    <div class="relative flex-1 rounded-xl overflow-hidden shadow-lg">
      {#if owTheme}
      <iframe 
        class="w-lg h-full" 
        src={getLayoutConfig(GamePrefix.OW, owTheme.activePrefix)?.cinematicUrl}
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
      <a href="https://overwatch.blizzard.com/en-us/news/24239094/director-s-take-three-strong/" target="_blank" class="relative rounded-xl shadow-lg h-full">
        <img src="https://bnetcmsus-a.akamaihd.net/cms/blog_header/ss/SSSBX1A86IBK1759452450416.png" alt="Ad" class="w-64 h-[40%] object-cover  cursor-pointer"/>
        <div class="h-[60%] bg-[#292a33]/80 max-w-64 text-white p-1 text-sm overflow-clip">
          <h1 class="2xl:text-lg font-semibold mb-2">Director's Take: Three Strong</h1>
          <p class="text-sm ">
            For Overwatch 2’s third anniversary, three of our directors—Aaron Keller, Alec Dawson, and Dion Rogers—reflect on the game’s history and the action-packed journey ahead. 
          </p>
        </div>
      </a>
    </div>
  </div>

  <div class="flex flex-col items-start mb-8 mt-2 w-full">
    <p class="text-gray-400 font-light mb-2">REGION / ACCOUNT</p><!--
    <Dropdown 
      items={dropdownItems.map(i => i.label)} 
      selected={selected?.label || ''} 
      onSelect={(label) => {
        selected = dropdownItems.find(i => i.label === label) || null;
      }} 
    />-->

   
    <div class="flex flex-row items-end justify-between w-full mt-2">
      <div class="flex flex-row items-end gap-x-4">
        <button  class=" relative w-64 px-12 py-6 text-4xl cursor-pointer text-white rounded-lg bg-gradient-to-b from-[#4aa1f3] to-[#0077c9] shadow-lg shadow-black/50 transform transition duration-150 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 active:shadow-md before:absolute before:inset-0 before:rounded-lg before:bg-white before:opacity-0 before:pointer-events-none hover:before:opacity-10">
          <span class="relative z-10">PLAY</span>
        </button>
        <span class="text-gray-400 text-sm">
          Version NO_VERSION | View the
          <a href="https://overwatch.blizzard.com/en-us/news/patch-notes/" target="_blank" class="text-blue-500"> Patch Notes</a>.
        </span>
      </div>
    </div>
  </div>
</div>
<div class="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none bg-gradient-to-t from-black/100 via-black/75 to-transparent -z-10"></div>
