<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { open = $bindable(false), keepMounted = false } = $props()
</script>

<Dialog.Root bind:open modal={false}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal {keepMounted}>
    <Dialog.Viewport data-testid="viewport">
      <Dialog.Popup data-testid="popup">Content</Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>
