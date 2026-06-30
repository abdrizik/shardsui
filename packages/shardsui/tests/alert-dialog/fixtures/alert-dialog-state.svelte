<script lang="ts">
  import { DialogContext } from '$lib/components/dialog/context'

  const dialog = DialogContext.get()
</script>

<div
  data-testid="alert-dialog-state"
  data-modal={dialog.modal}
  data-disable-pointer-dismissal={dialog.disablePointerDismissal}
  data-role={dialog.role}
></div>
