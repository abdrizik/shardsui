<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let {
    trigger1 = { top: 10, left: 10 },
    trigger2 = { top: 100, left: 200 }
  }: {
    trigger1?: { top: number; left: number }
    trigger2?: { top: number; left: number }
  } = $props()
</script>

<Tooltip.Root>
  {#snippet children({ payload })}
    <Tooltip.Trigger
      payload={0}
      delay={0}
      data-testid="trigger1"
      style="position: absolute; top: {trigger1.top}px; left: {trigger1.left}px; width: 100px; height: 50px;"
      >Trigger 1</Tooltip.Trigger
    >
    <Tooltip.Trigger
      payload={1}
      delay={0}
      data-testid="trigger2"
      style="position: absolute; top: {trigger2.top}px; left: {trigger2.left}px; width: 100px; height: 50px;"
      >Trigger 2</Tooltip.Trigger
    >
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup>
          <Tooltip.Viewport data-testid="viewport">
            <div data-testid="content">Content {payload}</div>
          </Tooltip.Viewport>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  {/snippet}
</Tooltip.Root>
