<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let { thumb = true }: { thumb?: boolean } = $props()
</script>

<ScrollArea.Root data-testid="root" style="height: 200px; width: 200px;">
  <ScrollArea.Viewport
    data-testid="viewport"
    style="height: 100%; width: 100%; scroll-snap-type: y mandatory;"
  >
    <div style="height: 1000px; width: 200px;"></div>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar
    orientation="vertical"
    data-testid="scrollbar-vertical"
    keepMounted
    style="width: 10px; height: 200px;"
  >
    {#if thumb}
      <ScrollArea.Thumb data-testid="thumb" />
    {/if}
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
