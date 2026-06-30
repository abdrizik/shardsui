<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'
  import AlertDialogState from './alert-dialog-state.svelte'

  let { handle }: { handle: AlertDialog.Handle } = $props()
</script>

<AlertDialog.Trigger {handle}>Open</AlertDialog.Trigger>

<AlertDialog.Root {handle}>
  <AlertDialogState />
  <AlertDialog.Portal>
    <AlertDialog.Popup>Content</AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
