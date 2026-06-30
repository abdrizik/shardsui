<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<Popover.Root>
  <Popover.Trigger data-testid="trigger" disabled openOnHover delay={0}>Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popover-popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
