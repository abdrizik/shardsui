<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<Popover.Root>
  <Popover.Trigger data-testid="reference">reference</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="floating">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
