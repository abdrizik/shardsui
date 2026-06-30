<script lang="ts">
  import { Popover } from '$lib/components/popover'
  let { open = true } = $props()
</script>

<Popover.Root {open}>
  <Popover.Trigger>Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup>
        <Popover.Title>Popover title</Popover.Title>
        <Popover.Description>Popover description</Popover.Description>
        <Popover.Close>Close</Popover.Close>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
