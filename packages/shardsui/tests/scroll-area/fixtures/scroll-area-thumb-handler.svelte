<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let {
    onThumbPointerDown = undefined,
    onThumbPointerMove = undefined
  }: {
    onThumbPointerDown?: (event: PointerEvent) => void
    onThumbPointerMove?: (event: PointerEvent) => void
  } = $props()
</script>

<ScrollArea.Root data-testid="root" style="height: 100px; width: 100px;">
  <ScrollArea.Viewport data-testid="viewport" style="height: 100%; max-height: 100%">
    <ScrollArea.Content data-testid="content">
      <div style="height: 500px; width: 500px;">Tall content</div>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical" data-testid="scrollbar-vertical" keepMounted>
    <ScrollArea.Thumb
      data-testid="thumb-vertical"
      onpointerdown={onThumbPointerDown}
      onpointermove={onThumbPointerMove}
    />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
