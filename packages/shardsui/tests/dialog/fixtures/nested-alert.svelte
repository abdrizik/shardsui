<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import { AlertDialog } from '$lib/components/alert-dialog'
</script>

<Dialog.Root>
  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup data-testid="parent-dialog">
      <AlertDialog.Root>
        <AlertDialog.Trigger>Open Alert</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Popup data-testid="nested-alert">
            <AlertDialog.Close>Close Alert</AlertDialog.Close>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <Dialog.Close>Close Dialog</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
