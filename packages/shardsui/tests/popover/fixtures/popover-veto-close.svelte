<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let open = $state(false)
</script>

<Popover.Root
  bind:open={
    () => open,
    (next) => {
      if (next) open = true
    }
  }
>
  <Popover.Trigger data-testid="trigger" id="trigger-1">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popover-popup">
        Content
        <Popover.Close data-testid="close" id="close-button">Close</Popover.Close>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
