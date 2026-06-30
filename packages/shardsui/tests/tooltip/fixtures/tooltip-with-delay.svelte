<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let { delay = 200, closeDelay = 0, closeOnClick = true, onOpenChange = undefined } = $props()
</script>

<Tooltip.Provider>
  <Tooltip.Root {onOpenChange}>
    <Tooltip.Trigger data-testid="trigger" {delay} {closeDelay} {closeOnClick}
      >Toggle</Tooltip.Trigger
    >
    <Tooltip.Portal>
      <Tooltip.Positioner data-testid="positioner">
        <Tooltip.Popup data-testid="popup">Content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
