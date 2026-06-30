<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'
</script>

<AlertDialog.Root open>
  <AlertDialog.Portal>
    <AlertDialog.Viewport data-testid="viewport">
      <AlertDialog.Popup>Dialog</AlertDialog.Popup>
    </AlertDialog.Viewport>
  </AlertDialog.Portal>
</AlertDialog.Root>
