<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
</script>

<Dialog.Root modal={false}>
  <Dialog.Trigger as="span" data-testid="trigger" disabled />
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Title>title text</Dialog.Title>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
