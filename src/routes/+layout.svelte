<script lang="ts">
    import type { Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import "../app.css";
    import { goto } from "$app/navigation";
    import NavLink from "../components/NavLink.svelte";
    import { ChevronDown } from "lucide-svelte";
    import { page } from "$app/state";

    let { data, children }: { data: LayoutData, children: Snippet } = $props();

    let selectedLink = $derived<'GAMES' | 'SHOP' | 'NEWS'>(
        page.url.pathname === '/' ? 'GAMES' : 
        page.url.pathname.startsWith('/news') ? 'NEWS' : 
        page.url.pathname.startsWith('/shop') ? 'SHOP' :
        'GAMES'
    );
</script>

<nav class="relative z-50 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 p-6 flex flex-row gap-x-10 flex-none">
    <button onclick={() => goto("/settings")} class="flex flex-row items-center cursor-pointer hover:opacity-80 transition-opacity">
        <img src="/images/battle_net_logo.webp" alt="battle.net logo" class="w-14 h-14 my-auto mr-6" />
        <ChevronDown />
    </button>
    <NavLink text="GAMES" selected={selectedLink === 'GAMES'} onClick={() => goto("/")}/>
    <NavLink text="SHOP" selected={selectedLink === 'SHOP'} onClick={() => goto("/shop")}/>
    <NavLink text="NEWS" selected={selectedLink === 'NEWS'} onClick={() => goto("/news")}/>
</nav>

<div class="flex flex-col w-full h-[calc(100vh-100px)]">
    {@render children()}
</div>