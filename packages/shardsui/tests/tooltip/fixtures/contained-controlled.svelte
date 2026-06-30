<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let open = $state(false)
  let activeTrigger = $state<string | null>(null)
</script>

<div>
  <Tooltip.Root {open} triggerId={activeTrigger} onOpenChange={(next) => (open = next)}>
    {#snippet children({ payload })}
      <Tooltip.Trigger payload={1} id="trigger-1" delay={0} data-testid="trigger-1"
        >Trigger 1</Tooltip.Trigger
      >
      <Tooltip.Trigger payload={2} id="trigger-2" delay={0} data-testid="trigger-2"
        >Trigger 2</Tooltip.Trigger
      >

      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>
            <span data-testid="content">{payload}</span>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    {/snippet}
  </Tooltip.Root>

  <button
    data-testid="open-1"
    onclick={() => {
      open = true
      activeTrigger = 'trigger-1'
    }}>Open Trigger 1</button
  >
  <button
    data-testid="open-2"
    onclick={() => {
      open = true
      activeTrigger = 'trigger-2'
    }}>Open Trigger 2</button
  >
  <button data-testid="close" onclick={() => (open = false)}>Close</button>
</div>
