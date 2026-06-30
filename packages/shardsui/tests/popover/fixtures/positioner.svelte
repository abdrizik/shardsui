<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type {
    Side,
    Align,
    OffsetFunction
  } from '$lib/internal/floating/anchor-positioning.svelte'

  let {
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0
  }: {
    side?: Side
    align?: Align
    sideOffset?: number | OffsetFunction
    alignOffset?: number | OffsetFunction
  } = $props()
</script>

<Popover.Root open>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner" {side} {align} {sideOffset} {alignOffset}>
      <Popover.Popup data-testid="popover-popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
