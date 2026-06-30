<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
</script>

<Tooltip.Root>
  <Tooltip.Trigger id="custom-button" delay={0} closeDelay={0} data-testid="trigger"
    >Trigger</Tooltip.Trigger
  >
  <Tooltip.Portal>
    <Tooltip.Positioner>
      <Tooltip.Popup data-testid="popup">Content</Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
