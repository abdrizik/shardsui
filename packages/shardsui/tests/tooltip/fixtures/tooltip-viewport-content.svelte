<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let { open = $bindable(false) } = $props()
</script>

<Tooltip.Root bind:open>
  <Tooltip.Trigger data-testid="trigger">Trigger</Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Positioner>
      <Tooltip.Popup>
        <Tooltip.Viewport>
          <div data-testid="content">Content</div>
        </Tooltip.Viewport>
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
