<script lang="ts">
  import Dropdown from '../../components/dropdown.svelte';
  import { ExpansionPrefix } from '../../data';
  import { launcherStyle } from '../../stores';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';

  let { data }: { data: PageData } = $props();

  // subscribe to store
  let layout: ExpansionPrefix = $state(ExpansionPrefix.Midnight);
  const unsubscribe = launcherStyle.subscribe((val) => layout = val);

  function selectStyle(xpac: ExpansionPrefix) {
    launcherStyle.set(xpac);
  }

  onMount(() => {
    return () => unsubscribe();
  });
</script>

<div class="w-full h-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800 p-4">
<h2>Change Launcher Theme:</h2>

  <Dropdown
      items={Object.values(ExpansionPrefix)}
      selected={layout}
      onSelect={(xpac: ExpansionPrefix) => selectStyle(xpac)}
  />
</div>
