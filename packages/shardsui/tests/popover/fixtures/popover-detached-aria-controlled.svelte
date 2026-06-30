<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle }: { handle: PopoverHandle } = $props()
</script>

<Popover.Trigger {handle} id="trigger-1" data-testid="trigger-1">Trigger 1</Popover.Trigger>
<Popover.Trigger {handle} id="trigger-2" data-testid="trigger-2">Trigger 2</Popover.Trigger>

<Popover.Root {handle} open triggerId="trigger-2">
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
