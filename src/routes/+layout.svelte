<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';
    import "../app.css";
    import { goto } from "$app/navigation";
    import NavLink from "../components/NavLink.svelte";
    import { ChevronDown, MinusIcon, RectangleHorizontalIcon, XIcon, User } from "lucide-svelte";
    import { page } from "$app/state";
    import { getFromStore, setToStore } from "../stores";
    import { getCurrentWindow } from "@tauri-apps/api/window";
    import { dev } from "$app/environment";
    import { checkAuth, type UserInfo } from "../data";
    import { invoke } from "@tauri-apps/api/core";
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
    let authenticated = $state(false);
    let userInfo = <UserInfo >$state()
    async function saveTokenData(accessToken: string, acquiredAt: string) {
    await setToStore('access_token', accessToken);
    await setToStore('acquired_at', acquiredAt);
    console.log('Token data saved to store!');
}
    onMount(async () => {
    // If app was started via deep link
    const startUrls = await getCurrent();
    if (startUrls) console.log('Initial deep link:', startUrls);

    // Listen for deep links
    await onOpenUrl(async (urls) => {
        const urlStr = urls[0];
        console.log('Deep link received:', urlStr);

        try {
            const url = new URL(urlStr);
            const accessToken = url.searchParams.get('access_token');
            const acquiredAt = url.searchParams.get('acquired_at');

            if (accessToken && acquiredAt) {
                await saveTokenData(accessToken, acquiredAt);
            } else {
                console.warn('Missing query parameters in deep link');
            }
        } catch (err) {
            console.error('Invalid URL:', err);
        }
        window.location.reload();
    });

    authenticated = await checkAuth();
    if (authenticated) {
    const token  = await getFromStore('access_token');
    userInfo =  await invoke('get_user_info', {accessToken: token}) as UserInfo;
    }

});


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
        <img src="{dev ? 'https://localhost:7176/' : 'https://twistingnetherapi.furyshiftz.com/'}static/images/battle_net_logo.webp" alt="battle.net logo" class="w-14 h-14 my-auto mr-6" />
        <ChevronDown />
    </button>
    <NavLink text="GAMES" selected={selectedLink === 'GAMES'} onClick={() => goto("/")}/>
    <NavLink text="SHOP" selected={selectedLink === 'SHOP'} onClick={() => goto("/shop")}/>
    <NavLink text="NEWS" selected={selectedLink === 'NEWS'} onClick={() => goto("/news")}/>
        {#if userInfo}
        <div class="ml-auto flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600/40 to-blue-800/40 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 backdrop-blur-sm">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                <User size={18} className="text-white" />
            </div>
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Logged in as</span>
                <span class="text-sm font-bold text-white tracking-wide">{userInfo.battletag}</span>
            </div>
        </div>
        {/if}
</nav>

<div class="flex flex-col w-full h-[calc(100vh-132px)]">
    {@render children()}
</div>