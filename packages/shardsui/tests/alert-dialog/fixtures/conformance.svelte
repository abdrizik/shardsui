<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { open = undefined, popupId = undefined }: { open?: boolean; popupId?: string } = $props()
</script>

<AlertDialog.Root {open}>
  <AlertDialog.Trigger data-testid="trigger">Open dialog</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Popup id={popupId} data-testid="popup">Dialog</AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
