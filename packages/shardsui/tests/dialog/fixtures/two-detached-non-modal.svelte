<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  const handle = new Dialog.Handle()
</script>

<Dialog.Trigger {handle}>Trigger 1</Dialog.Trigger>
<Dialog.Trigger {handle}>Trigger 2</Dialog.Trigger>
<Dialog.Root {handle} modal={false}>
  <Dialog.Portal>
    <Dialog.Popup>Dialog Content</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
