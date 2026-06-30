<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  let { onOpenChange = undefined } = $props()
</script>

<Dialog.Root {onOpenChange}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup data-testid="dialog-popup">
      <Dialog.Title>Dialog title</Dialog.Title>
      <Dialog.Description>Dialog description</Dialog.Description>
      <Dialog.Root>
        <Dialog.Trigger>Open nested</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup data-testid="nested-dialog-popup">
            <Dialog.Title>Nested dialog title</Dialog.Title>
            <Dialog.Close>Close nested</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
