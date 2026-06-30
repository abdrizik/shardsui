<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import { DirectionProvider } from '$lib/components/direction-provider'
  import type {
    Align,
    OffsetFunction,
    Side
  } from '$lib/internal/floating/anchor-positioning.svelte'
  import type { TextDirection } from '$lib/internal/direction-context'

  let {
    side = 'bottom',
    align = 'center',
    direction = 'ltr',
    sideOffset = 0,
    alignOffset = 0
  }: {
    side?: Side
    align?: Align
    direction?: TextDirection
    sideOffset?: number | OffsetFunction
    alignOffset?: number | OffsetFunction
  } = $props()
</script>

<DirectionProvider {direction}>
  <Popover.Root open>
    <Popover.Trigger as="div" data-testid="trigger" style="width: 72px; height: 36px;">
      Trigger
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner data-testid="positioner" {side} {align} {sideOffset} {alignOffset}>
        <Popover.Popup data-testid="popup" style="width: 52px; height: 24px;">Popup</Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</DirectionProvider>
