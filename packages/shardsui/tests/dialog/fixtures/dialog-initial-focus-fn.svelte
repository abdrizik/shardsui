<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { initialFocus = undefined } = $props()
</script>

<Dialog.Root modal={false}>
  <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup data-testid="dialog" {initialFocus}>
      <input data-testid="input-1" />
      <input data-testid="input-2" />
      <Dialog.Close data-testid="close">Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
