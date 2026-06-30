<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { handle }: { handle: AlertDialog.Handle } = $props()
</script>

<div>
  <AlertDialog.Trigger {handle} id="trigger">Trigger</AlertDialog.Trigger>
  <AlertDialog.Root {handle}>
    <AlertDialog.Portal>
      <AlertDialog.Popup data-testid="content">Content</AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</div>
