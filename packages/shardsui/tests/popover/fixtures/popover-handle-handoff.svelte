<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'
  import OpenOnMount from './open-on-mount.svelte'

  let {
    handle,
    phase = 'outgoing'
  }: { handle: PopoverHandle; phase?: 'outgoing' | 'overlap' | 'incoming' } = $props()
</script>

<Popover.Trigger {handle} id="trigger" data-testid="trigger">Trigger</Popover.Trigger>

{#if phase === 'outgoing' || phase === 'overlap'}
  <Popover.Root {handle}>
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup data-testid="outgoing">Outgoing</Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
{/if}
{#if phase === 'overlap' || phase === 'incoming'}
  <Popover.Root {handle}>
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup data-testid="incoming">Incoming</Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
  <OpenOnMount {handle} />
{/if}
