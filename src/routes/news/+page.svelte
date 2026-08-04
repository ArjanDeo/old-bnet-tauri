<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Webview } from '@tauri-apps/api/webview';
    import { getCurrentWindow, type Window } from "@tauri-apps/api/window";
    import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";

    let newsWebview: Webview | null = null;
    let isLoading = $state(true);
    let unlistenResize: (() => void) | null = null;

    async function syncWebviewBounds(mainWindow: Window) {
        if (!newsWebview) return;

        const scaleFactor = await mainWindow.scaleFactor();
        const physicalSize = await mainWindow.innerSize();
        const logicalSize = physicalSize.toLogical(scaleFactor);

        await newsWebview.setSize(new LogicalSize(logicalSize.width, logicalSize.height - 100));
        await newsWebview.setPosition(new LogicalPosition(0, 100));
    }

    onMount(async () => {
        try {
            const mainWindow = getCurrentWindow();
            const scaleFactor = await mainWindow.scaleFactor();
            const physicalSize = await mainWindow.innerSize();
            const logicalSize = physicalSize.toLogical(scaleFactor);

            newsWebview = new Webview(mainWindow, 'bnet-news-embedded', {
                url: 'https://news.blizzard.com/en-us',
                width: logicalSize.width,
                height: logicalSize.height - 100,
                x: 0,
                y: 100,
            });

            newsWebview.once('tauri://created', () => {
                isLoading = false;
            });

            newsWebview.once('tauri://error', (e) => {
                console.error('News webview error:', e);
                isLoading = false;
            });

            unlistenResize = await mainWindow.onResized(async () => {
                await syncWebviewBounds(mainWindow);
            });

        } catch (error) {
            console.error('Failed to create news webview:', error);
            isLoading = false;
        }
    });

    onDestroy(async () => {
        unlistenResize?.();

        if (newsWebview) {
            try {
                await newsWebview.close();
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