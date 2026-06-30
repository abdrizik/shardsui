<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let {
    rootAs = undefined,
    viewportAs = undefined,
    contentAs = undefined,
    scrollbarAs = undefined,
    thumbAs = undefined
  }: {
    rootAs?: keyof HTMLElementTagNameMap
    viewportAs?: keyof HTMLElementTagNameMap
    contentAs?: keyof HTMLElementTagNameMap
    scrollbarAs?: keyof HTMLElementTagNameMap
    thumbAs?: keyof HTMLElementTagNameMap
  } = $props()
</script>

<ScrollArea.Root as={rootAs} data-testid="root" style="height: 100px; width: 100px;">
  <ScrollArea.Viewport
    as={viewportAs}
    data-testid="viewport"
    style="height: 100%; max-height: 100%"
  >
    <ScrollArea.Content as={contentAs} data-testid="content">
      <div style="height: 500px; width: 500px;">Tall content</div>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar
    as={scrollbarAs}
    orientation="vertical"
    data-testid="scrollbar-vertical"
    keepMounted
  >
    <ScrollArea.Thumb as={thumbAs} data-testid="thumb-vertical" />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal" data-testid="scrollbar-horizontal" keepMounted>
    <ScrollArea.Thumb data-testid="thumb-horizontal" />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner data-testid="corner" />
</ScrollArea.Root>
