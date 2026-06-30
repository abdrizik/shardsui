<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'
  import OpenOnMount from './open-on-mount.svelte'

  let { handle }: { handle: PopoverHandle } = $props()
</script>

<Popover.Root {handle}>
  <Popover.Trigger id="trigger" data-testid="trigger">Trigger</Popover.Trigger>
  <OpenOnMount {handle} />
</Popover.Root>
