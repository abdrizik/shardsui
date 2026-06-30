<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type {
    Side,
    Align,
    OffsetFunction
  } from '$lib/internal/floating/anchor-positioning.svelte'

  let {
    side = undefined,
    align = undefined,
    sideOffset = 0,
    alignOffset = 0
  }: {
    side?: Side
    align?: Align
    sideOffset?: number | OffsetFunction
    alignOffset?: number | OffsetFunction
  } = $props()
</script>

<PreviewCard.Root open>
  <PreviewCard.Trigger as="div" style="width: 72px; height: 36px;">Trigger</PreviewCard.Trigger>
  <PreviewCard.Portal>
    <PreviewCard.Positioner data-testid="positioner" {side} {align} {sideOffset} {alignOffset}>
      <PreviewCard.Popup style="width: 52px; height: 24px;">Popup</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
