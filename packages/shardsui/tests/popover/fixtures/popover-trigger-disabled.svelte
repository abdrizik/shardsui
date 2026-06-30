<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { disabled = false } = $props()
</script>

<Popover.Root>
  <Popover.Trigger data-testid="trigger" {disabled}>Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
