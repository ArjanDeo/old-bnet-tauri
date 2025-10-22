<script lang="ts">
  import Dropdown from '../../components/dropdown.svelte';
  import { WoWExpansionLabels, WoWExpansionPrefix, type GameTheme } from '../../data';
  import { GameThemeStore } from '../../stores';
  import { onMount } from 'svelte';

  let selectedExpansion: WoWExpansionPrefix = WoWExpansionPrefix.Midnight; // default

  // Subscribe to store to get current WoW theme
  let wowTheme: GameTheme | undefined;
  const unsubscribe = GameThemeStore.subscribe((themes) => {
    wowTheme = themes.find(t => t.game === 'wow');
    if (wowTheme) {
      selectedExpansion = wowTheme.activePrefix as WoWExpansionPrefix;
    }
  });

  // Update activeIndex in the store when user selects a new expansion
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

  onMount(() => {
    return () => unsubscribe();
  });
</script>

<div class="w-full p-4">
  <h2 class="text-white mb-2">Change WoW Theme:</h2>

  <Dropdown
    items={Object.keys(WoWExpansionLabels)}
    selected={Object.entries(WoWExpansionLabels).find(([label, xpac]) => xpac === selectedExpansion)?.[0]}
    onSelect={(xpac: string) => selectStyle(xpac as WoWExpansionPrefix)}
  />
</div>
