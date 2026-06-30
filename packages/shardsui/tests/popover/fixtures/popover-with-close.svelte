<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { open = false, onOpenChange = undefined, keepMounted = false } = $props()
</script>

<Popover.Root {open} {onOpenChange}>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal {keepMounted}>
    <Popover.Positioner>
      <Popover.Popup data-testid="popup">
        <Popover.Title data-testid="title">Popover title</Popover.Title>
        <Popover.Description data-testid="description">Popover description</Popover.Description>
        Content
        <Popover.Close data-testid="close">Close</Popover.Close>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
