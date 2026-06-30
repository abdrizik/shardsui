<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
</script>

<Tooltip.Provider delay={0}>
  <Tooltip.Root>
    <Tooltip.Trigger data-testid="trigger-1">Trigger 1</Tooltip.Trigger>
    <Tooltip.Trigger data-testid="trigger-2">Trigger 2</Tooltip.Trigger>
    <Tooltip.Trigger data-testid="trigger-3">Trigger 3</Tooltip.Trigger>

    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="popup">Tooltip Content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
