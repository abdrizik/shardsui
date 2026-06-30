<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { handle }: { handle: AlertDialog.Handle } = $props()
</script>

<div>
  <AlertDialog.Trigger {handle}>Trigger 1</AlertDialog.Trigger>
  <AlertDialog.Trigger {handle}>Trigger 2</AlertDialog.Trigger>
  <AlertDialog.Trigger {handle}>Trigger 3</AlertDialog.Trigger>

  <AlertDialog.Root {handle}>
    <AlertDialog.Portal>
      <AlertDialog.Popup>
        <AlertDialog.Title>Alert dialog content</AlertDialog.Title>
        <AlertDialog.Close>Close</AlertDialog.Close>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</div>
