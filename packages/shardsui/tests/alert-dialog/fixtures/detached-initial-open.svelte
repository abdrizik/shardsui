<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { handle }: { handle: AlertDialog.Handle } = $props()
</script>

<AlertDialog.Trigger {handle} id="trigger">Open</AlertDialog.Trigger>

<AlertDialog.Root {handle} open triggerId="trigger">
  <AlertDialog.Portal>
    <AlertDialog.Popup>Dialog</AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
