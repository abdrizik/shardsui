<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { handle }: { handle: AlertDialog.Handle } = $props()

  let open = $state(false)
</script>

<AlertDialog.Root
  {handle}
  bind:open={
    () => open,
    (next) => {
      if (next) open = true
    }
  }
>
  <AlertDialog.Trigger>Open</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Popup>
      <AlertDialog.Title>Confirm</AlertDialog.Title>
      <AlertDialog.Close>Cancel</AlertDialog.Close>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
