<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'

  let { handle, rootMounted = true }: { handle: TooltipHandle<number>; rootMounted?: boolean } =
    $props()
</script>

<Tooltip.Trigger {handle} id="trigger" payload={1} delay={0} data-testid="trigger">
  Trigger
</Tooltip.Trigger>

{#if rootMounted}
  <Tooltip.Root {handle}>
    {#snippet children({ payload })}
      <span data-testid="payload">{payload ?? 'No payload'}</span>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup data-testid="popup">Tooltip Content</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    {/snippet}
  </Tooltip.Root>
{/if}
