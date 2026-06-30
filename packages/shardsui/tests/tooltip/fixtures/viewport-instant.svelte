<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
</script>

<Tooltip.Root>
  <Tooltip.Trigger delay={0} closeDelay={0} data-testid="trigger">Trigger</Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Positioner>
      <Tooltip.Popup>
        <Tooltip.Viewport data-testid="viewport">Content</Tooltip.Viewport>
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
