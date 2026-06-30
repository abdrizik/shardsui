<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<Popover.Root>
  <Popover.Trigger data-testid="trigger-1">Trigger 1</Popover.Trigger>
  <Popover.Trigger data-testid="trigger-2">Trigger 2</Popover.Trigger>
  <Popover.Trigger data-testid="trigger-3">Trigger 3</Popover.Trigger>

  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup">
        Popover Content
        <Popover.Close data-testid="close">Close</Popover.Close>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
