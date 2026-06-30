<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let {
    arrowPadding = undefined,
    triggerWidth = 20
  }: { arrowPadding?: number; triggerWidth?: number } = $props()
</script>

<div style="position: fixed; top: 0; left: 0;">
  <Tooltip.Root open>
    <Tooltip.Trigger style="width: {triggerWidth}px; height: 20px;">T</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner side="bottom" {arrowPadding}>
        <Tooltip.Popup style="width: 200px; height: 40px;">
          <Tooltip.Arrow data-testid="arrow" style="width: 10px; height: 10px;" />
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</div>
