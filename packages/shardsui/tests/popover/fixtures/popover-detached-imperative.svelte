<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle }: { handle: PopoverHandle } = $props()
</script>

<Popover.Trigger {handle} id="trigger" data-testid="trigger">Trigger</Popover.Trigger>

<Popover.Root {handle}>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
