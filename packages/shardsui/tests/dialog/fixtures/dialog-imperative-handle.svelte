<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { handle } = $props()
</script>

<Dialog.Trigger {handle} id="trigger-a" data-testid="trigger-a">Trigger A</Dialog.Trigger>

<Dialog.Root {handle}>
  <Dialog.Portal>
    <Dialog.Popup>
      Dialog Content
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
