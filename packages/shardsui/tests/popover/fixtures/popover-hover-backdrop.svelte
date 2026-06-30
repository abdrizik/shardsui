<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { delay = 0, openOnHover = true }: { delay?: number; openOnHover?: boolean } = $props()
</script>

<Popover.Root>
  <Popover.Trigger data-testid="trigger" {openOnHover} {delay}>Open</Popover.Trigger>
  <Popover.Portal>
    <Popover.Backdrop data-testid="backdrop" />
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popover-popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
