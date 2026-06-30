<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
</script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger delay={0} data-testid="trigger-1">First</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup class="group-tooltip" data-testid="popup-1">First tooltip</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger delay={0} data-testid="trigger-2">Second</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup class="group-tooltip" data-testid="popup-2">Second tooltip</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>

<style>
  :global {
    .group-tooltip {
      transition: opacity 20ms;
    }

    .group-tooltip[data-starting-style],
    .group-tooltip[data-ending-style] {
      opacity: 0;
    }

    .group-tooltip[data-instant] {
      transition: none;
    }
  }
</style>
