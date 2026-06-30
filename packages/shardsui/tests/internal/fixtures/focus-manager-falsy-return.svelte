<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
</script>

<Dialog.Root modal={false}>
  <Dialog.Trigger data-testid="reference">reference</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup data-testid="floating" finalFocus={() => undefined}>
      <Dialog.Close data-testid="close">close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
