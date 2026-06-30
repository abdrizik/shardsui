<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { finalFocus = undefined } = $props()
</script>

<Dialog.Root>
  <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup data-testid="dialog" {finalFocus}>
      <Dialog.Close data-testid="close">Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
