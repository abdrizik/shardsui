<script lang="ts">
  import { Popover } from '$lib/components/popover'
  let {
    open = false,
    onOpenChange = undefined,
    modal = false,
    includeBackdrop = false,
    includeClose = false,
    popupId = undefined
  } = $props()
</script>

<Popover.Root {open} {onOpenChange} {modal}>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    {#if includeBackdrop}
      <Popover.Backdrop data-testid="backdrop" />
    {/if}
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popover-popup" id={popupId}>
        {#if includeClose}
          <Popover.Close>Close</Popover.Close>
        {/if}
        Content
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
