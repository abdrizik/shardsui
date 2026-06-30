<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let inputElement = $state<HTMLElement | null>(null)
</script>

<div>
  <Dialog.Root>
    <Dialog.Backdrop />
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup finalFocus={() => inputElement}>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
  <input data-testid="input-to-focus" bind:this={inputElement} />
</div>
