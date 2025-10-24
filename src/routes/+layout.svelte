<script lang="ts">
    import type { Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import "../app.css";
    import { goto } from "$app/navigation";
    import NavLink from "../components/NavLink.svelte";
    import { ChevronDown } from "lucide-svelte";

  let { data, children }: { data: LayoutData, children: Snippet } = $props();
  let selectedLink = $state<'GAMES' | 'SHOP' | 'NEWS'>('GAMES');

</script>
<nav class="relative z-50 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 p-6 flex flex-row gap-x-10 flex-none bglsate">
    <button onclick={() => goto("/settings")} class="flex flex-row items-center cursor-pointer">
      <img src="/images/battle_net_logo.webp" alt="battle.net logo" class="w-14 h-14 my-auto mr-6" />
      <ChevronDown />
    </button>
    <NavLink text="GAMES" selected={selectedLink=='GAMES'} onClick={() => goto("/")}/>
    <NavLink text="SHOP" selected={selectedLink=='SHOP'} onClick={() => selectedLink='SHOP'}/>
    <NavLink text="NEWS" selected={selectedLink=='NEWS'} onClick={() => selectedLink='NEWS'}/>
  </nav>
<div class="flex flex-col w-full">
  {@render children()}
</div>