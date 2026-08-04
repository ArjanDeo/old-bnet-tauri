<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Webview } from '@tauri-apps/api/webview';
    import { getCurrentWindow, type Window } from "@tauri-apps/api/window";
    import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";

    let shopWebview: Webview | null = null;
    let isLoading = $state(true);
    let unlistenResize: (() => void) | null = null;

    async function syncWebviewBounds(mainWindow: Window) {
        if (!shopWebview) return;

        const scaleFactor = await mainWindow.scaleFactor();
        const physicalSize = await mainWindow.innerSize();
        const logicalSize = physicalSize.toLogical(scaleFactor);

        await shopWebview.setSize(new LogicalSize(logicalSize.width, logicalSize.height - 100));
        await shopWebview.setPosition(new LogicalPosition(0, 100));
    }

    onMount(async () => {
        try {
            const mainWindow = getCurrentWindow();
            const scaleFactor = await mainWindow.scaleFactor();
            const physicalSize = await mainWindow.innerSize();
            const logicalSize = physicalSize.toLogical(scaleFactor);

            shopWebview = new Webview(mainWindow, 'bnet-shop-embedded', {
                url: 'https://us.shop.battle.net/en-us/',
                width: logicalSize.width,
                height: logicalSize.height - 100,
                x: 0,
                y: 100,
            });

            shopWebview.once('tauri://created', () => {
                isLoading = false;
            });

            shopWebview.once('tauri://error', (e) => {
                console.error('Webview error:', e);
                isLoading = false;
            });

            // Keep the embedded webview in sync with window resizes
            unlistenResize = await mainWindow.onResized(async () => {
                await syncWebviewBounds(mainWindow);
            });

        } catch (error) {
            console.error('Failed to create webview:', error);
            isLoading = false;
        }
    });

    onDestroy(async () => {
        unlistenResize?.();

        if (shopWebview) {
            try {
                await shopWebview.close();
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