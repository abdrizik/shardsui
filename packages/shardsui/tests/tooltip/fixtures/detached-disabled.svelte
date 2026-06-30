<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'

  let { handle }: { handle: TooltipHandle<number> } = $props()
</script>

<Tooltip.Trigger {handle} payload={1} delay={0} data-testid="trigger-1">Trigger 1</Tooltip.Trigger>
<Tooltip.Trigger {handle} payload={2} delay={0} disabled data-testid="trigger-2"
  >Trigger 2</Tooltip.Trigger
>

<Tooltip.Root {handle}>
  {#snippet children({ payload })}
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="popup">
          <span data-testid="content">{payload}</span>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  {/snippet}
</Tooltip.Root>
