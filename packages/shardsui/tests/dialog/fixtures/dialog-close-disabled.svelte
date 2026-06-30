<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { onOpenChange = undefined, closeDisabled = false } = $props()
</script>

<Dialog.Root {onOpenChange}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup>
      <Dialog.Close disabled={closeDisabled}>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
