<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { top = 0, keepMounted = false } = $props()
</script>

<Popover.Root open>
  <Popover.Trigger
    data-testid="trigger"
    style="width: 100px; height: 100px; position: relative; top: {top}px"
  >
    Trigger
  </Popover.Trigger>
  <Popover.Portal {keepMounted}>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup" style="width: 100px; height: 100px">Popup</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
