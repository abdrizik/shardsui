<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'
  import { DirectionProvider } from '$lib/components/direction-provider'
  import type { Attachment } from 'svelte/attachments'
  import { mockOverflowMetrics } from './scroll-metrics'

  let {
    viewportSize = 200,
    contentWidth = 1000,
    contentHeight = 1000,
    overflowEdgeThreshold = undefined,
    keepMounted = false,
    mockMetrics = false,
    direction = 'ltr',
    horizontal = true,
    corner = false,
    cornerAs = undefined,
    content = false,
    vScrollbarStyle = '',
    hScrollbarStyle = '',
    vThumbStyle = '',
    hThumbStyle = ''
  }: {
    viewportSize?: number
    contentWidth?: number
    contentHeight?: number
    overflowEdgeThreshold?:
      | number
      | Partial<{ xStart: number; xEnd: number; yStart: number; yEnd: number }>
    keepMounted?: boolean
    mockMetrics?: boolean
    direction?: 'ltr' | 'rtl'
    horizontal?: boolean
    corner?: boolean
    cornerAs?: keyof HTMLElementTagNameMap
    content?: boolean
    vScrollbarStyle?: string
    hScrollbarStyle?: string
    vThumbStyle?: string
    hThumbStyle?: string
  } = $props()

  const attachMetrics: Attachment<HTMLElement> = (node) => {
    if (mockMetrics) mockOverflowMetrics(node)
  }
</script>

<DirectionProvider {direction}>
  <ScrollArea.Root
    data-testid="root"
    {overflowEdgeThreshold}
    style="width: {viewportSize}px; height: {viewportSize}px; direction: {direction};"
  >
    <ScrollArea.Viewport
      data-testid="viewport"
      style="width: 100%; height: 100%;"
      {@attach attachMetrics}
    >
      {#if content}
        <ScrollArea.Content data-testid="content">
          <div style="width: {contentWidth}px; height: {contentHeight}px;"></div>
        </ScrollArea.Content>
      {:else}
        <div style="width: {contentWidth}px; height: {contentHeight}px;"></div>
      {/if}
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar
      orientation="vertical"
      data-testid="scrollbar-vertical"
      {keepMounted}
      style={vScrollbarStyle}
    >
      <ScrollArea.Thumb data-testid="thumb-vertical" style={vThumbStyle} />
    </ScrollArea.Scrollbar>
    {#if horizontal}
      <ScrollArea.Scrollbar
        orientation="horizontal"
        data-testid="scrollbar-horizontal"
        {keepMounted}
        style={hScrollbarStyle}
      >
        <ScrollArea.Thumb data-testid="thumb-horizontal" style={hThumbStyle} />
      </ScrollArea.Scrollbar>
    {/if}
    {#if corner}
      <ScrollArea.Corner as={cornerAs} data-testid="corner" />
    {/if}
  </ScrollArea.Root>
</DirectionProvider>
