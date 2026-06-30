<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
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

<Tooltip.Root open>
  <Tooltip.Trigger as="div" style="width: 72px; height: 36px;">Trigger</Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Positioner data-testid="positioner" {side} {align} {sideOffset} {alignOffset}>
      <Tooltip.Popup style="width: 52px; height: 24px;">Popup</Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
