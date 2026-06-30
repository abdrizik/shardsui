<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle }: { handle: PopoverHandle } = $props()
</script>

<Popover.Root {handle}>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup>First</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>

<Popover.Root {handle}>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup>Second</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
