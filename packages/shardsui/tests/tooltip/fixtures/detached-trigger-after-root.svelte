<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'

  let { handle }: { handle: TooltipHandle } = $props()
</script>

<div>
  <Tooltip.Root {handle}>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup data-testid="content">Content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
  <Tooltip.Trigger {handle} id="trigger" data-testid="trigger">Trigger</Tooltip.Trigger>
</div>
