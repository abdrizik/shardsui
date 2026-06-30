<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let { open = undefined, popupId = undefined }: { open?: boolean; popupId?: string } = $props()
</script>

<Tooltip.Provider delay={0}>
  <Tooltip.Root {open}>
    <Tooltip.Trigger data-testid="trigger">Hover me</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup id={popupId} data-testid="popup">Tooltip content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
