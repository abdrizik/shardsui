<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { keepMounted = false, open = false } = $props()
</script>

<Dialog.Root {open} modal={false}>
  <Dialog.Portal {keepMounted}>
    <Dialog.Popup data-testid="popup">Content</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
