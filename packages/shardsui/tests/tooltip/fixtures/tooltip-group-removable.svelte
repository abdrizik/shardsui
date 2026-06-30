<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let { delay = 0, closeDelay = 0, timeout = 400, showFirst = true } = $props()
</script>

<Tooltip.Provider {delay} {closeDelay} {timeout}>
  {#if showFirst}
    <Tooltip.Root>
      <Tooltip.Trigger data-testid="trigger-1">One</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup data-testid="popup-1">First</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  {/if}

  <Tooltip.Root>
    <Tooltip.Trigger data-testid="trigger-2">Two</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="popup-2">Second</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
