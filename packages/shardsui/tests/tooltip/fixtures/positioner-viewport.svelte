<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let { withViewport = false }: { withViewport?: boolean } = $props()
</script>

<Tooltip.Root open>
  <Tooltip.Trigger as="div" style="width: 72px; height: 36px;">Trigger</Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Positioner data-testid="positioner">
      <Tooltip.Popup style="width: 52px; height: 24px;">
        {#if withViewport}
          <Tooltip.Viewport>Popup</Tooltip.Viewport>
        {:else}
          Popup
        {/if}
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
