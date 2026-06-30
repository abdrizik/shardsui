<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'
  import TooltipOpenOnMount from './tooltip-open-on-mount.svelte'

  let {
    handle,
    phase = 'outgoing',
    onOpenError
  }: {
    handle: TooltipHandle
    phase?: 'outgoing' | 'overlap' | 'incoming'
    onOpenError?: (error: unknown) => void
  } = $props()
</script>

<Tooltip.Trigger {handle} id="trigger" data-testid="trigger">Trigger</Tooltip.Trigger>

{#if phase === 'outgoing' || phase === 'overlap'}
  {#key 'outgoing'}
    <Tooltip.Root {handle}>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>Outgoing</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  {/key}
{/if}

{#if phase === 'overlap' || phase === 'incoming'}
  {#key 'incoming'}
    <Tooltip.Root {handle}>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>Incoming</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  {/key}
  <TooltipOpenOnMount {handle} triggerId="trigger" onError={onOpenError} />
{/if}
