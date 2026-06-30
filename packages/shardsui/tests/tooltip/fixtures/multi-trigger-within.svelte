<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let {
    open = $bindable(true),
    triggerId = 'trigger-1',
    onOpenChange = undefined
  }: {
    open?: boolean
    triggerId?: string
    onOpenChange?: (open: boolean) => void
  } = $props()

  let showFirstTrigger = $state(true)
</script>

<button data-testid="remove-first" onclick={() => (showFirstTrigger = false)}>remove</button>

<Tooltip.Root bind:open {triggerId} {onOpenChange}>
  {#snippet children({ payload })}
    <div>
      {#if showFirstTrigger}
        <Tooltip.Trigger id="trigger-1" payload={1} delay={0} data-testid="trigger-1"
          >Trigger 1</Tooltip.Trigger
        >
      {/if}
      <Tooltip.Trigger id="trigger-2" payload={2} delay={0} data-testid="trigger-2"
        >Trigger 2</Tooltip.Trigger
      >
    </div>

    <Tooltip.Portal>
      <Tooltip.Positioner side="bottom" align="start" data-testid="positioner">
        <Tooltip.Popup data-testid="popup">
          <span data-testid="content">{payload}</span>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  {/snippet}
</Tooltip.Root>
