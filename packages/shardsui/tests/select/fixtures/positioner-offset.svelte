<script lang="ts">
  import { Select } from '$lib/components/select'
  import type {
    Side,
    Align,
    OffsetFunction
  } from '$lib/internal/floating/anchor-positioning.svelte'

  let {
    sideOffset = undefined,
    alignOffset = undefined,
    side = undefined,
    align = 'center'
  }: {
    sideOffset?: number | OffsetFunction
    alignOffset?: number | OffsetFunction
    side?: Side
    align?: Align
  } = $props()
</script>

<Select.Root open>
  <Select.Trigger style="width:72px;height:36px">Trigger</Select.Trigger>
  <Select.Portal>
    <Select.Positioner
      data-testid="positioner"
      {side}
      {align}
      sideOffset={sideOffset as never}
      alignOffset={alignOffset as never}
    >
      <Select.Popup style="width:52px;height:24px">Popup</Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
