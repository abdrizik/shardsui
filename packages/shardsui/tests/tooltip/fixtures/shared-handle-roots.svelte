<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'

  let { handle }: { handle: TooltipHandle } = $props()
</script>

<Tooltip.Root {handle}>
  <Tooltip.Portal>
    <Tooltip.Positioner>
      <Tooltip.Popup>First</Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>

<Tooltip.Root {handle}>
  <Tooltip.Portal>
    <Tooltip.Positioner>
      <Tooltip.Popup>Second</Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
