<script lang="ts">
  import { Menu } from '$lib/components/menu'
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

<Menu.Root open>
  <Menu.Trigger as="div" style="width: 72px; height: 36px;">Trigger</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner data-testid="positioner" {side} {align} {sideOffset} {alignOffset}>
      <Menu.Popup style="width: 52px; height: 24px;">Popup</Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
