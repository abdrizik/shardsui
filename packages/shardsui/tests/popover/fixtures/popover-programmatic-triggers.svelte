<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle, detached = false }: { handle?: PopoverHandle<number>; detached?: boolean } =
    $props()

  let open = $state(false)
  let triggerId = $state<string | null>(null)

  function openWith(id: string) {
    triggerId = id
    open = true
  }
</script>

{#snippet triggers()}
  <Popover.Trigger {handle} id="trigger-1" payload={1} data-testid="trigger-1">
    Trigger 1
  </Popover.Trigger>
  <Popover.Trigger {handle} id="trigger-2" payload={2} data-testid="trigger-2">
    Trigger 2
  </Popover.Trigger>
{/snippet}

<div style="margin: 50px">
  {#if detached}
    {@render triggers()}
  {/if}
  <Popover.Root {handle} bind:open {triggerId}>
    {#snippet children({ payload })}
      {#if !detached}
        {@render triggers()}
      {/if}
      <Popover.Portal>
        <Popover.Positioner data-testid="positioner" side="bottom" align="start">
          <Popover.Popup data-testid="popup">
            <span data-testid="content">{payload}</span>
            <Popover.Close data-testid="close">Close</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    {/snippet}
  </Popover.Root>
  <button type="button" data-testid="open-1" onclick={() => openWith('trigger-1')}>
    Open Trigger 1
  </button>
  <button type="button" data-testid="open-2" onclick={() => openWith('trigger-2')}>
    Open Trigger 2
  </button>
</div>
