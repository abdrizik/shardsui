<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { open = undefined, triggerId = undefined }: { open?: boolean; triggerId?: string | null } =
    $props()
</script>

<AlertDialog.Root {open} {triggerId}>
  {#snippet children({ payload })}
    <AlertDialog.Trigger id="trigger-1" payload={1} data-testid="trigger-1"
      >Trigger 1</AlertDialog.Trigger
    >
    <AlertDialog.Trigger id="trigger-2" payload={2} data-testid="trigger-2"
      >Trigger 2</AlertDialog.Trigger
    >

    <AlertDialog.Portal>
      <AlertDialog.Popup data-testid="alert-dialog-popup">
        <AlertDialog.Title>Confirm</AlertDialog.Title>
        <span data-testid="content">{payload}</span>
        <AlertDialog.Close>Close</AlertDialog.Close>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  {/snippet}
</AlertDialog.Root>
