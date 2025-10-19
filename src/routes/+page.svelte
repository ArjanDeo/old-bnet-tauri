<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { Settings, SquareCheckBig } from 'lucide-svelte';
  import GameLogoPanel from "../components/GameLogoPanel.svelte";
  import Dropdown from "../components/dropdown.svelte";
  import { ExpansionPrefix } from "../data";
  import { launcherStyle } from "../stores";
  
  let name = $state("");
  let greetMsg = $state("");
  let selected = $state('Legion');
  let layout = $state<ExpansionPrefix>(ExpansionPrefix.Midnight);
  
  const versions = ['7.0.3 PTR', 'Legion', 'Legion Beta'];
  
  async function greet(event: Event) {
    event.preventDefault();
    greetMsg = await invoke("greet", { name });
  }
  
  // Subscribe to launcher style changes
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

<div class="flex flex-col justify-between h-[100vh] p-10 ">
  <div class=" max-h-24 2xl:max-h-30">
    <GameLogoPanel 
      layout={layout} 
      options={[
        { icon: Settings, label: "Options" }, 
        { icon: SquareCheckBig, label: "Redeem a Code" }
      ]}
    />
  </div>
  
  <div class="flex flex-row gap-4 mt-20 2xl:mt-24 h-64 3xl:h-80">
    <!-- Main Video Section -->
    <div class="relative flex-1 rounded-xl overflow-hidden shadow-lg">
      <iframe 
        class="w-lg h-full" 
        src="https://www.youtube.com/embed/eYNCCu0y-Is?si=2sGFqmyoK2GZNqky" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen
      ></iframe>
    </div>
    
    <!-- Right Column: Ads / Info -->
    <div class="flex flex-row gap-4 w-80 max-h-full">
      <!-- Advertisement / Event Image -->
      <a href="https://worldofwarcraft.com" target="_blank" class="relative rounded-xl shadow-lg h-full">
        <img src="images/leg_remix_art.png" alt="Ad" class="w-64 h-[40%] object-cover cursor-pointer"/>
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
    <Dropdown items={versions} selected={selected} onSelect={(v) => selected = v} />
   
    <div class="flex flex-row items-end justify-between w-full mt-2">
      <div class="flex flex-row items-end gap-x-4">
        <button class="bg-gradient-to-b from-[#4aa1f3] to-[#0077c9] shadow-md cursor-pointer px-12 py-6 text-4xl text-center text-white rounded-lg w-64 flex-shrink-0">
          PLAY
        </button>
        <span class="text-gray-400 text-sm">
          Version 7.0.3.35662 | View the
          <a href="https://twistingnether.furyshiftz.com/" target="_blank" class="text-blue-500"> Patch Notes</a>.
        </span>
      </div>
    </div>
  </div>
</div>
<div class="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md
 -z-10"></div>
