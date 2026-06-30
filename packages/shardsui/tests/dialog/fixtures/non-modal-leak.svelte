<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import { AlertDialog } from '$lib/components/alert-dialog'

  let confirmationOpen = $state(false)
</script>

<div>
  <div
    data-testid="surface"
    onclick={() => (confirmationOpen = true)}
    style="width: 100px; height: 100px;"
    role="presentation"
  >
    surface
  </div>

  <Dialog.Root open modal={false}>
    <Dialog.Portal>
      <Dialog.Popup>
        <textarea data-testid="nonmodal-field"></textarea>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>

  <AlertDialog.Root open={confirmationOpen} onOpenChange={(next) => (confirmationOpen = next)}>
    <AlertDialog.Portal>
      <AlertDialog.Popup>
        <AlertDialog.Close data-testid="go-back">Go back</AlertDialog.Close>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</div>
