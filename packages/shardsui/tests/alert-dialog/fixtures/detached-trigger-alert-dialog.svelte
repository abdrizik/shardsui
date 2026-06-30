<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { handle }: { handle: AlertDialog.Handle } = $props()
</script>

<AlertDialog.Trigger {handle} data-testid="trigger">Open</AlertDialog.Trigger>

<AlertDialog.Root {handle}>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop data-testid="backdrop" />
    <AlertDialog.Popup data-testid="alert-dialog-popup">
      <AlertDialog.Title>Alert Dialog Title</AlertDialog.Title>
      <AlertDialog.Close>Close</AlertDialog.Close>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
