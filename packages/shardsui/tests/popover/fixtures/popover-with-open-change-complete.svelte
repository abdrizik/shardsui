<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { open = $bindable(false), onOpenChangeComplete = undefined } = $props()
</script>

<Popover.Root bind:open {onOpenChangeComplete}>
  <Popover.Trigger>Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popover-popup">
        <Popover.Close>Close</Popover.Close>
        Content
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
