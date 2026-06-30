<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  type Props = {
    open?: boolean
    lock?: () => () => void
    unlockDelay?: number
  }

  let { open = $bindable(false), lock, unlockDelay = 200 }: Props = $props()

  function openDialog() {
    if (lock) {
      const unlock = lock()
      setTimeout(unlock, unlockDelay)
    }
    open = true
  }
</script>

<button onclick={openDialog}>Open dialog</button>
<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Popup>
      <Dialog.Close>Close dialog</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
