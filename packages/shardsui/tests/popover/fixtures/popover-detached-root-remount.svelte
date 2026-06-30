<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle, rootMounted = true }: { handle: PopoverHandle<number>; rootMounted?: boolean } =
    $props()
</script>

<Popover.Trigger {handle} id="trigger" payload={1} data-testid="trigger">Trigger</Popover.Trigger>

{#if rootMounted}
  <Popover.Root {handle}>
    {#snippet children({ payload })}
      <span data-testid="payload">{payload ?? 'No payload'}</span>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup data-testid="popup">Popover Content</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    {/snippet}
  </Popover.Root>
{/if}
