<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let {
    onRootPointerMove = undefined,
    onViewportScroll = undefined,
    onScrollbarPointerDown = undefined
  }: {
    onRootPointerMove?: (event: PointerEvent) => void
    onViewportScroll?: (event: Event) => void
    onScrollbarPointerDown?: (event: PointerEvent) => void
  } = $props()
</script>

<ScrollArea.Root
  data-testid="root"
  style="height: 100px; width: 100px;"
  onpointermove={onRootPointerMove}
>
  <ScrollArea.Viewport
    data-testid="viewport"
    style="height: 100%; max-height: 100%"
    onscroll={onViewportScroll}
  >
    <ScrollArea.Content data-testid="content">
      <div style="height: 500px; width: 500px;">Tall content</div>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar
    orientation="vertical"
    data-testid="scrollbar-vertical"
    keepMounted
    onpointerdown={onScrollbarPointerDown}
  >
    <ScrollArea.Thumb data-testid="thumb-vertical" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
