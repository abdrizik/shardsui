<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import { AlertDialog } from '$lib/components/alert-dialog'
</script>

<AlertDialog.Root open>
  <AlertDialog.Portal>
    <AlertDialog.Popup data-testid="parent-dialog" />
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Popup data-testid="nested-dialog">
          <Dialog.Root>
            <Dialog.Portal>
              <Dialog.Popup />
            </Dialog.Portal>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  </AlertDialog.Portal>
</AlertDialog.Root>
