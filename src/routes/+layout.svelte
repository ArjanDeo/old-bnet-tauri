<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import "../app.css";
    import { goto } from "$app/navigation";
    import NavLink from "../components/NavLink.svelte";
    import { ChevronDown, MinusIcon, RectangleHorizontalIcon, XIcon } from "lucide-svelte";
    import { page } from "$app/state";
    import { getFromStore } from "../stores";
    import { getCurrentWindow } from "@tauri-apps/api/window";
    const appWindow = getCurrentWindow();
    function minimize() {
        appWindow.minimize();
    }
    function maximize() {
        appWindow.toggleMaximize();
    }
    function close() {
        appWindow.close();
    }
    let { data, children }: { data: LayoutData, children: Snippet } = $props();
    let selectedLink = $derived<'GAMES' | 'SHOP' | 'NEWS'>(
        page.url.pathname === '/' ? 'GAMES' : 
        page.url.pathname.startsWith('/news') ? 'NEWS' : 
        page.url.pathname.startsWith('/shop') ? 'SHOP' :
        'GAMES'
    );
</script>

<section data-tauri-drag-region class="relative z-50 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border-b-2 border-b-gray-400/20 h-8 flex flex-row items-center justify-end px-2 gap-x-2">
    <button onclick={minimize} class="cursor-pointer hover:bg-gray-700 hover:bg-opacity-50 p-1 rounded transition-colors">
        <MinusIcon size={16} className="text-gray-300" />
    </button>
    <button onclick={maximize} class="cursor-pointer hover:bg-gray-700 hover:bg-opacity-50 p-1 rounded transition-colors">
        <RectangleHorizontalIcon size={16} className="text-gray-300" />
    </button>
    <button onclick={close} class="cursor-pointer hover:bg-red-600 hover:bg-opacity-50 p-1 rounded transition-colors">
        <XIcon size={16} className="text-gray-300" />
    </button>
</section>

<nav class="relative z-50 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 p-4 flex flex-row gap-x-10 flex-none">
    <button onclick={() => goto("/settings")} class="flex flex-row items-center cursor-pointer hover:opacity-80 transition-opacity">
        <img src="/images/battle_net_logo.webp" alt="battle.net logo" class="w-14 h-14 my-auto mr-6" />
        <ChevronDown />
    </button>
    <NavLink text="GAMES" selected={selectedLink === 'GAMES'} onClick={() => goto("/")}/>
    <NavLink text="SHOP" selected={selectedLink === 'SHOP'} onClick={() => goto("/shop")}/>
    <NavLink text="NEWS" selected={selectedLink === 'NEWS'} onClick={() => goto("/news")}/>
</nav>

<div class="flex flex-col w-full h-[calc(100vh-132px)]">
    {@render children()}
</div>