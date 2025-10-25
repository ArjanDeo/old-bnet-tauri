<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Webview } from '@tauri-apps/api/webview';
    import { getCurrentWindow } from "@tauri-apps/api/window";

    let shopWebview: Webview | null = null;
    let isLoading = $state(true);
    let isDestroyed = false;

    onMount(async () => {
        try {
            console.log('Shop page mounted');
            const mainWindow = getCurrentWindow();
            const size = await mainWindow.innerSize();
            
            shopWebview = new Webview(mainWindow, 'bnet-shop-embedded', {
                url: 'https://us.shop.battle.net/en-us/',
                width: size.width,
                height: size.height,
                x: 0,
                y: 100,
            });
            
            shopWebview.once('tauri://created', () => {
                console.log('Shop webview loaded');
                isLoading = false;
            });
            
            shopWebview.once('tauri://error', (e) => {
                console.error('Webview error:', e);
                isLoading = false;
            });
            
        } catch (error) {
            console.error('Failed to create webview:', error);
            isLoading = false;
        }
    });

    onDestroy(async () => {
        console.log('Shop page unmounting - destroying webview');
        isDestroyed = true;
        
        if (shopWebview) {
            try {
                await shopWebview.close();
                console.log('Webview closed successfully');
                shopWebview = null;
            } catch (error) {
                console.error('Error closing webview:', error);
            }
        }
    });
</script>

{#if isLoading}
    <div class="flex items-center justify-center h-full">
        <p class="text-white text-xl">Loading Shop...</p>
    </div>
{/if}