<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { open = undefined, popupId = undefined }: { open?: boolean; popupId?: string } = $props()
</script>

<Popover.Root {open}>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup id={popupId} data-testid="popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
