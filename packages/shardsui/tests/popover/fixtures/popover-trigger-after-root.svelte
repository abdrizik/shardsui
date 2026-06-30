<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle }: { handle: PopoverHandle } = $props()
</script>

<Popover.Root {handle}>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup">Popover Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>

<Popover.Trigger {handle} id="trigger" data-testid="trigger">Trigger</Popover.Trigger>
