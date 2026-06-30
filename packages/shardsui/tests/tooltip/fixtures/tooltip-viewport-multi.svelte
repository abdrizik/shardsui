<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'

  let { handle }: { handle: TooltipHandle<string> } = $props()
</script>

<Tooltip.Trigger {handle} id="trigger-1" payload="first" data-testid="trigger1"
  >Trigger 1</Tooltip.Trigger
>
<Tooltip.Trigger {handle} id="trigger-2" payload="second" data-testid="trigger2"
  >Trigger 2</Tooltip.Trigger
>

<Tooltip.Root {handle}>
  {#snippet children({ payload })}
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="popup">
          <Tooltip.Viewport>
            {#if payload === 'first'}
              <div data-testid="payload-1">Preview 1</div>
            {/if}
            {#if payload === 'second'}
              <div data-testid="payload-2">Preview 2</div>
            {/if}
          </Tooltip.Viewport>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  {/snippet}
</Tooltip.Root>
