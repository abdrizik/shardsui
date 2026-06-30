<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'
</script>

<ScrollArea.Root data-testid="root" style="width: 400px; height: 200px;">
  <ScrollArea.Viewport
    data-testid="viewport"
    style="width: 100%; height: 100%; scroll-snap-type: x mandatory;"
  >
    <div style="display: flex;">
      {#each Array.from({ length: 10 }) as _, index (index)}
        <div style="flex-shrink: 0; width: 200px; height: 100px; scroll-snap-align: start;"></div>
      {/each}
    </div>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="horizontal" data-testid="scrollbar" keepMounted>
    <ScrollArea.Thumb data-testid="thumb" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
