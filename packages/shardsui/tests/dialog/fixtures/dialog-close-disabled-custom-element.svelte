<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { onOpenChange = undefined } = $props()
</script>

<Dialog.Root {onOpenChange}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup>
      <Dialog.Close as="span" disabled>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
