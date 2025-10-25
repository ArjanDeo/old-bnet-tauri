<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Webview } from '@tauri-apps/api/webview';
    import { getCurrentWindow } from "@tauri-apps/api/window";

    let newsWebview: Webview | null = null;
    let isLoading = $state(true);
    let isDestroyed = false;

    onMount(async () => {
        try {
            console.log('News page mounted');
            const mainWindow = getCurrentWindow();
            const size = await mainWindow.innerSize();
            
            newsWebview = new Webview(mainWindow, 'bnet-news-embedded', {
                url: 'https://news.blizzard.com/en-us',
                width: size.width,
                height: size.height,
                x: 0,
                y: 100,
            });
            
            newsWebview.once('tauri://created', () => {
                console.log('News webview loaded');
                isLoading = false;
            });
            
            newsWebview.once('tauri://error', (e) => {
                console.error('News webview error:', e);
                isLoading = false;
            });
            
        } catch (error) {
            console.error('Failed to create news webview:', error);
            isLoading = false;
        }
    });

    onDestroy(async () => {
        console.log('News page unmounting - destroying webview');
        isDestroyed = true;
        
        if (newsWebview) {
            try {
                await newsWebview.close();
                console.log('News webview closed successfully');
                newsWebview = null;
            } catch (error) {
                console.error('Error closing news webview:', error);
            }
        }
    });
</script>

{#if isLoading}
    <div class="flex items-center justify-center h-full">
        <p class="text-white text-xl">Loading News...</p>
    </div>
{/if}