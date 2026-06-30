<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { handle }: { handle: AlertDialog.Handle<number> } = $props()
</script>

<div>
  <AlertDialog.Trigger {handle} id="trigger1" payload={1}>Trigger 1</AlertDialog.Trigger>
  <AlertDialog.Trigger {handle} id="trigger2" payload={2}>Trigger 2</AlertDialog.Trigger>

  <AlertDialog.Root {handle}>
    {#snippet children({ payload })}
      <AlertDialog.Portal>
        <AlertDialog.Popup data-testid="alert-dialog-popup">
          <AlertDialog.Title>Confirm</AlertDialog.Title>
          <span data-testid="content">{payload}</span>
          <AlertDialog.Close>Close</AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    {/snippet}
  </AlertDialog.Root>
</div>
