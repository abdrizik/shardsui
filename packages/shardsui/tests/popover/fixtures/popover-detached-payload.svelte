<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let {
    handle,
    open = $bindable(false),
    triggerId = undefined
  }: {
    handle: PopoverHandle<number>
    open?: boolean
    triggerId?: string | null
  } = $props()
</script>

<Popover.Trigger {handle} id="trigger-1" payload={1} data-testid="trigger-1"
  >Trigger 1</Popover.Trigger
>
<Popover.Trigger {handle} id="trigger-2" payload={2} data-testid="trigger-2"
  >Trigger 2</Popover.Trigger
>

<Popover.Root {handle} bind:open {triggerId}>
  {#snippet children({ payload })}
    <Popover.Portal>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popup">
          <span data-testid="content">{payload}</span>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  {/snippet}
</Popover.Root>
