<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let { delay = 0, closeDelay = 0, timeout = 400 } = $props()
</script>

<Tooltip.Provider {delay} {closeDelay} {timeout}>
  <Tooltip.Root>
    <Tooltip.Trigger data-testid="trigger-1">One</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="popup-1">First</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger data-testid="trigger-2">Two</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="popup-2">Second</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger data-testid="trigger-3">Three</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="popup-3">Third</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
