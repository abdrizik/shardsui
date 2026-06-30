<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let open = $state(false)
</script>

<Popover.Root
  bind:open={
    () => open,
    (next) => {
      if (!next) open = false
    }
  }
>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popover-popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
