<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let open = $state(false)
</script>

<Tooltip.Provider delay={0}>
  <Tooltip.Root
    bind:open={
      () => open,
      (next) => {
        if (!next) open = false
      }
    }
  >
    <Tooltip.Trigger data-testid="trigger">Hover me</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner data-testid="positioner">
        <Tooltip.Popup data-testid="popup">Tooltip content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
