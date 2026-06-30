<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'
  import CornerSizeProbe from './corner-size-probe.svelte'
  import { SCROLLABLE_CONTENT_SIZE, VIEWPORT_SIZE } from './scroll-metrics'

  let { onRead }: { onRead: () => void } = $props()
</script>

<ScrollArea.Root style="width: {VIEWPORT_SIZE}px; height: {VIEWPORT_SIZE}px;">
  <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%;">
    <div style="width: {SCROLLABLE_CONTENT_SIZE}px; height: {SCROLLABLE_CONTENT_SIZE}px;"></div>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical" style="width: 10px;">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal" style="height: 10px;">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner data-testid="corner" />
  <CornerSizeProbe {onRead} />
</ScrollArea.Root>
