<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { handle } = $props()
</script>

<Dialog.Trigger id="trigger" {handle}>Trigger</Dialog.Trigger>
<Dialog.Root {handle} open triggerId="trigger" modal={false}>
  <Dialog.Portal>
    <Dialog.Popup data-testid="popup">Dialog Content</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
