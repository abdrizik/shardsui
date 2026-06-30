<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import { AlertDialog } from '$lib/components/alert-dialog'

  let open = $state(false)
  let confirmationOpen = $state(false)
  let value = $state('')
</script>

<Dialog.Root
  bind:open={
    () => open,
    (next) => {
      if (!next && value) {
        confirmationOpen = true
        return
      }
      open = next
    }
  }
>
  <Dialog.Trigger data-testid="trigger">Tweet</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop data-testid="backdrop" />
    <Dialog.Popup>
      <textarea data-testid="textarea" bind:value></textarea>
    </Dialog.Popup>
  </Dialog.Portal>

  <AlertDialog.Root open={confirmationOpen} onOpenChange={(next) => (confirmationOpen = next)}>
    <AlertDialog.Portal>
      <AlertDialog.Popup>
        <AlertDialog.Close data-testid="go-back">Go back</AlertDialog.Close>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</Dialog.Root>
