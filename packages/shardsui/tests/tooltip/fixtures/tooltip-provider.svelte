<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let {
    providerDelay = 600,
    providerCloseDelay = 0,
    triggerDelay
  }: {
    providerDelay?: number
    providerCloseDelay?: number
    triggerDelay?: number
  } = $props()
</script>

<Tooltip.Provider delay={providerDelay} closeDelay={providerCloseDelay}>
  <Tooltip.Root>
    <Tooltip.Trigger data-testid="trigger" delay={triggerDelay}>Toggle</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="popup">Content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
