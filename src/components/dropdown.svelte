<script lang="ts">
  import { onMount } from 'svelte';

  export let items: any[] = [];
  export let selected: any;
  export let onSelect: (item: any) => void;
  let open = false;
  let dropUp = false;

  let buttonEl: HTMLButtonElement;
  let dropdownEl: HTMLUListElement;

  function toggleDropdown() {
    if (!open) {
      // Check available space below
      const rect = buttonEl.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = dropdownEl?.offsetHeight || (items.length * 40); // estimate
      dropUp = dropdownHeight > spaceBelow;
    }
    open = !open;
  }
</script>

<div class="relative w-64">
  <button
    bind:this={buttonEl}
    class="w-full flex justify-between items-center px-4 py-2 bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-lg border border-gray-700 text-white hover:bg-gray-800 transition"
    on:click={toggleDropdown}
  >
    <span>{selected}</span>
    <svg class="w-4 h-4 ml-2 transition-transform" class:rotate-180={open}>
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  </button>

  {#if open}
    <ul
      bind:this={dropdownEl}
      class="absolute w-full bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-lg border border-gray-700 text-white shadow-lg z-10 transition"
      class:bottom-full={dropUp}
      class:mb-1={!dropUp}
      class:mt-1={dropUp}
    >
      {#each items as item}
        <li
          class="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer transition"
          on:click={() => { onSelect(item); open = false; }}
        >
          {item}
        </li>
      {/each}
    </ul>
  {/if}
</div>
