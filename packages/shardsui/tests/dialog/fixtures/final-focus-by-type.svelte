<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { keepMounted = false }: { keepMounted?: boolean } = $props()

  let inputElement = $state<HTMLElement | null>(null)

  function elementFor(type: string) {
    if (type === 'keyboard') {
      return inputElement
    }
    return true
  }
</script>

<div>
  <Dialog.Root>
    <Dialog.Backdrop />
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal {keepMounted}>
      <Dialog.Popup finalFocus={elementFor}>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
  <input data-testid="final-input" bind:this={inputElement} />
</div>
