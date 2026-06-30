<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { withFinalFocus = false } = $props()

  let initialElement = $state<HTMLElement | null>(null)
  let finalElement = $state<HTMLElement | null>(null)
</script>

<div>
  <input data-testid="initial-outside" bind:this={initialElement} />
  <Dialog.Root>
    <Dialog.Backdrop />
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup
        initialFocus={() => initialElement}
        finalFocus={withFinalFocus ? () => finalElement : undefined}
      >
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
  <input data-testid="final-outside" bind:this={finalElement} />
</div>
