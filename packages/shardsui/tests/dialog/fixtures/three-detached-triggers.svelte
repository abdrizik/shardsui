<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  const handle = new Dialog.Handle()
</script>

<div>
  <Dialog.Trigger {handle}>Trigger 1</Dialog.Trigger>
  <Dialog.Trigger {handle}>Trigger 2</Dialog.Trigger>
  <Dialog.Trigger {handle}>Trigger 3</Dialog.Trigger>
  <Dialog.Root {handle}>
    <Dialog.Portal>
      <Dialog.Popup>
        Dialog Content
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</div>
