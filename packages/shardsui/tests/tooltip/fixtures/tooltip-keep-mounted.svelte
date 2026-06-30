<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let { keepMounted = false }: { keepMounted?: boolean } = $props()
</script>

<Tooltip.Root>
  <Tooltip.Trigger>Trigger</Tooltip.Trigger>
  <Tooltip.Portal {keepMounted}>
    <Tooltip.Positioner>
      <Tooltip.Popup data-testid="popup">Content</Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
