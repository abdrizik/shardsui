<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { initialFocus = undefined, finalFocus = undefined, open = undefined } = $props()

  let secondInputElement = $state<HTMLElement | null>(null)
  let altFocusElement = $state<HTMLElement | null>(null)

  const resolvedInitialFocus = $derived(
    initialFocus === 'second-input'
      ? (secondInputElement ?? undefined)
      : initialFocus === 'false'
        ? false
        : undefined
  )

  const resolvedFinalFocus = $derived(
    finalFocus === 'alt-focus'
      ? (altFocusElement ?? undefined)
      : finalFocus === 'false'
        ? false
        : undefined
  )
</script>

<button data-testid="alt-focus-target" bind:this={altFocusElement}>Alt Focus Target</button>

<Dialog.Root {open} modal={true}>
  <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup
      data-testid="popup"
      initialFocus={resolvedInitialFocus}
      finalFocus={resolvedFinalFocus}
    >
      <input data-testid="first-input" />
      <input data-testid="second-input" bind:this={secondInputElement} />
      <Dialog.Close data-testid="close">Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
