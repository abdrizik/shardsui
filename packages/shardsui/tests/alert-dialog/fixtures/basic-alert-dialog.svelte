<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let {
    open = undefined,
    onOpenChange = undefined
  }: { open?: boolean; onOpenChange?: (open: boolean) => void } = $props()
</script>

<AlertDialog.Root {open} {onOpenChange}>
  <AlertDialog.Trigger data-testid="trigger">Open</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop data-testid="backdrop" />
    <AlertDialog.Popup data-testid="alert-dialog-popup">
      <AlertDialog.Title>Alert Dialog Title</AlertDialog.Title>
      <AlertDialog.Description>Alert Dialog Description</AlertDialog.Description>
      <AlertDialog.Close>Close</AlertDialog.Close>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
