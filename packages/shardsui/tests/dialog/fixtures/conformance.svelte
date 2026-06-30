<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { open = undefined, popupId = undefined }: { open?: boolean; popupId?: string } = $props()
</script>

<Dialog.Root {open}>
  <Dialog.Trigger data-testid="trigger">Open dialog</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup id={popupId} data-testid="popup">Dialog</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
