<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle }: { handle: PopoverHandle } = $props()
</script>

<Popover.Trigger {handle} id="trigger-1" data-testid="trigger-1">One</Popover.Trigger>
<Popover.Trigger {handle} id="trigger-2" data-testid="trigger-2">Two</Popover.Trigger>
<Popover.Trigger {handle} id="trigger-3" data-testid="trigger-3">Three</Popover.Trigger>

<Popover.Root {handle}>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup">
        Content
        <Popover.Close data-testid="close">Close</Popover.Close>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
