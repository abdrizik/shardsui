<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'

  let {
    handle,
    open = $bindable(false),
    triggerId = undefined
  }: {
    handle: TooltipHandle<number>
    open?: boolean
    triggerId?: string | null
  } = $props()
</script>

<div style="margin: 50px">
  <Tooltip.Trigger {handle} id="trigger-1" payload={1} data-testid="trigger-1"
    >Trigger 1</Tooltip.Trigger
  >
  <Tooltip.Trigger {handle} id="trigger-2" payload={2} data-testid="trigger-2"
    >Trigger 2</Tooltip.Trigger
  >

  <Tooltip.Root {handle} bind:open {triggerId}>
    {#snippet children({ payload })}
      <Tooltip.Portal>
        <Tooltip.Positioner data-testid="positioner" side="bottom" align="start">
          <Tooltip.Popup data-testid="popup">
            <span data-testid="content">{payload}</span>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    {/snippet}
  </Tooltip.Root>
</div>
