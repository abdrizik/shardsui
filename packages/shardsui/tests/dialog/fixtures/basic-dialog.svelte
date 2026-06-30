<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  let {
    open = undefined,
    onOpenChange = undefined,
    modal = true,
    disablePointerDismissal = false,
    includeBackdrop = false,
    popupTestId = 'dialog-popup',
    popupId = undefined
  }: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    modal?: boolean | 'trap-focus'
    disablePointerDismissal?: boolean
    includeBackdrop?: boolean
    popupTestId?: string
    popupId?: string
  } = $props()
</script>

<Dialog.Root {open} {onOpenChange} {modal} {disablePointerDismissal}>
  <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
  <Dialog.Portal>
    {#if includeBackdrop}
      <Dialog.Backdrop data-testid="backdrop" />
    {/if}
    <Dialog.Popup id={popupId} data-testid={popupTestId}>
      <Dialog.Title>Dialog title</Dialog.Title>
      <Dialog.Description>Dialog description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
