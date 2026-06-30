<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { Side, OffsetFunction } from '$lib/internal/floating/anchor-positioning.svelte'

  let {
    side = 'bottom',
    sideOffset = 5,
    delay = 0,
    open = undefined,
    tabindex = undefined,
    scrollSpacers = false,
    marginTop = 0,
    popupHeight = 40
  }: {
    side?: Side
    sideOffset?: number | OffsetFunction
    delay?: number
    open?: boolean
    tabindex?: number
    scrollSpacers?: boolean
    marginTop?: number
    popupHeight?: number
  } = $props()
</script>

{#if scrollSpacers}
  <div style="height: 1200px;"></div>
{/if}

<div style="width: 140px; margin-top: {marginTop}px;">
  <PreviewCard.Root {open}>
    <PreviewCard.Trigger
      {delay}
      data-testid="trigger"
      style="display: inline; line-height: 20px;"
      {tabindex}
    >
      This is a long text that will wrap across multiple lines in the trigger element
    </PreviewCard.Trigger>
    <PreviewCard.Portal>
      <PreviewCard.Positioner data-testid="positioner" {side} {sideOffset}>
        <PreviewCard.Popup data-testid="popup" style="width: 80px; height: {popupHeight}px;">
          Preview Content
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>
</div>

{#if scrollSpacers}
  <div style="height: 1200px;"></div>
{/if}
