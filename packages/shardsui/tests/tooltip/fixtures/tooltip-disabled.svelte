<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let {
    disabled = $bindable(false),
    triggerDisabled = undefined,
    open = false,
    trackCursorAxis = 'none'
  }: {
    disabled?: boolean
    triggerDisabled?: boolean
    open?: boolean
    trackCursorAxis?: 'none' | 'x' | 'y' | 'both'
  } = $props()
</script>

<button data-testid="disable" onclick={() => (disabled = true)}>Disable</button>

<Tooltip.Provider delay={0}>
  <Tooltip.Root {open} {disabled} {trackCursorAxis}>
    <Tooltip.Trigger data-testid="trigger" delay={0} disabled={triggerDisabled}
      >Toggle</Tooltip.Trigger
    >
    <Tooltip.Portal>
      <Tooltip.Positioner data-testid="positioner">
        <Tooltip.Popup data-testid="popup">Content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
