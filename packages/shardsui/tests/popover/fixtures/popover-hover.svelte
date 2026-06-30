<script lang="ts">
  import { Popover } from '$lib/components/popover'
  let {
    openOnHover = true,
    delay = undefined,
    closeDelay = undefined,
    modal = false,
    includeClose = false,
    onOpenChange = undefined
  }: {
    openOnHover?: boolean
    delay?: number
    closeDelay?: number
    modal?: boolean | 'trap-focus'
    includeClose?: boolean
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Popover.Root {onOpenChange} {modal}>
  <Popover.Trigger data-testid="trigger" {openOnHover} {delay} {closeDelay}>Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popover-popup">
        {#if includeClose}
          <Popover.Close data-testid="close">Close</Popover.Close>
        {/if}
        Content
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
