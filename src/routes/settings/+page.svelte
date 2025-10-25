<script lang="ts">
  import Dropdown from '../../components/dropdown.svelte';
  import { WoWExpansionLabels, WoWExpansionPrefix, type GameTheme } from '../../data';
  import { GameThemeStore, getFromStore, setToStore } from '../../stores';
  import { onMount, onDestroy } from 'svelte';
  
  let selectedExpansion: WoWExpansionPrefix = WoWExpansionPrefix.Midnight;
  let playMusic = $state(false);
  let trackWoWPlaytime = $state(false);
  let isLoading = $state(true);
  
  let wowTheme: GameTheme | undefined;
  
  const unsubscribe = GameThemeStore.subscribe((themes) => {
    wowTheme = themes.find(t => t.game === 'wow');
    if (wowTheme) {
      selectedExpansion = wowTheme.activePrefix as WoWExpansionPrefix;
    }
  });
  
  function selectStyle(xpac: string) {
    if (!wowTheme) return;
    
    const xpacInternalValue = WoWExpansionLabels[xpac];
    const index = Object.values(WoWExpansionPrefix).indexOf(xpacInternalValue);
    
    GameThemeStore.update(themes =>
      themes.map(t =>
        t.game === 'wow' ? { ...t, activePrefix: xpacInternalValue, activeIndex: index } : t
      )
    );
    
    selectedExpansion = xpacInternalValue;
  }
  
  onMount(async () => {
    try {
      const [storedPlayMusic, storedTrackPlaytime] = await Promise.all([
        getFromStore('settings-playMusic'),
        getFromStore('settings-trackWoWPlaytime')
      ]);
      
      if (storedPlayMusic !== null) playMusic = storedPlayMusic;
      if (storedTrackPlaytime !== null) trackWoWPlaytime = storedTrackPlaytime;
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      isLoading = false;
    }
  });
  
  // Separate effect for saving settings
  $effect(() => {
    // Skip saving during initial load
    if (isLoading) return;
    
    setToStore('settings-playMusic', playMusic).catch(error => 
      console.error('Failed to save playMusic setting:', error)
    );
  });
  
  $effect(() => {
    if (isLoading) return;
    
    setToStore('settings-trackWoWPlaytime', trackWoWPlaytime).catch(error => 
      console.error('Failed to save trackWoWPlaytime setting:', error)
    );
  });
  
  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="w-full p-4">
  <section class="mb-6">
    <h2 class="text-white text-lg font-semibold mb-2">Change WoW Theme</h2>
    <Dropdown
      items={Object.keys(WoWExpansionLabels)}
      selected={Object.entries(WoWExpansionLabels).find(([_, xpac]) => xpac === selectedExpansion)?.[0] ?? ''}
      onSelect={(xpac: string) => selectStyle(xpac)}
    />
  </section>
  
  <section class="mb-6">
    <label class="flex items-center gap-3 cursor-pointer group">
      <input 
        type="checkbox" 
        bind:checked={playMusic}
        disabled={isLoading}
        class="w-4 h-4 cursor-pointer accent-blue-500"
      />
      <span class="text-white group-hover:text-gray-200 transition-colors">
        Play theme music on game pages
      </span>
    </label>
  </section>
  
  <section>
    <label class="flex items-start gap-3 cursor-pointer group">
      <input 
        type="checkbox" 
        bind:checked={trackWoWPlaytime}
        disabled={isLoading}
        class="w-4 h-4 mt-1 cursor-pointer accent-blue-500"
      />
      <span class="text-white group-hover:text-gray-200 transition-colors">
        Track Playtime for WoW
        <span class="block text-sm text-gray-400 mt-1">
          Requires <a 
            href="https://github.com/ArjanDeo/TotalPlayed" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-blue-500 hover:text-blue-400 transition-colors underline"
          >TotalPlayed</a> addon
        </span>
      </span>
    </label>
  </section>
</div>