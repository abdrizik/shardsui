<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<Popover.Root open>
  <Popover.Trigger data-testid="trigger">Trigger</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popover-popup">
        <Popover.Description>Title</Popover.Description>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
