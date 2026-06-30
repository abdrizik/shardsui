<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'

  let { handle }: { handle: TooltipHandle<number> } = $props()

  let open = $state(true)
  let showFirstTrigger = $state(true)
</script>

<button data-testid="remove-first" onclick={() => (showFirstTrigger = false)}>remove</button>

<div>
  {#if showFirstTrigger}
    <Tooltip.Trigger {handle} id="trigger-1" payload={1} delay={0} data-testid="trigger-1"
      >Trigger 1</Tooltip.Trigger
    >
  {/if}
  <Tooltip.Trigger {handle} id="trigger-2" payload={2} delay={0} data-testid="trigger-2"
    >Trigger 2</Tooltip.Trigger
  >
</div>

<Tooltip.Root
  {handle}
  bind:open={
    () => open,
    (next) => {
      if (next) open = true
    }
  }
  triggerId="trigger-1"
>
  {#snippet children({ payload })}
    <Tooltip.Portal>
      <Tooltip.Positioner side="bottom" align="start">
        <Tooltip.Popup data-testid="popup">
          <span data-testid="content">{payload}</span>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  {/snippet}
</Tooltip.Root>
