<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let {
    delay = 0,
    onOpenChange = undefined,
    open = $bindable(false),
    disableHoverablePopup = false
  } = $props()
</script>

<Tooltip.Provider {delay}>
  <Tooltip.Root bind:open {onOpenChange} {disableHoverablePopup}>
    <Tooltip.Trigger data-testid="trigger">Hover me</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner data-testid="positioner">
        <Tooltip.Popup data-testid="popup">Tooltip content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
