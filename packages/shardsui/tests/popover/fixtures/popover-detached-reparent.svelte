<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle, nesting = 0 }: { handle: PopoverHandle; nesting?: 0 | 1 | 2 | 3 } = $props()
</script>

{#snippet trigger()}
  <Popover.Trigger {handle} id="trigger" data-testid="trigger">Trigger</Popover.Trigger>
{/snippet}

{#if nesting === 0}
  {@render trigger()}
{:else if nesting === 1}
  <div>{@render trigger()}</div>
{:else if nesting === 2}
  <div><div>{@render trigger()}</div></div>
{:else}
  <div><div><div>{@render trigger()}</div></div></div>
{/if}

<Popover.Root {handle}>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup">
        Popover Content
        <Popover.Close data-testid="close">Close</Popover.Close>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
