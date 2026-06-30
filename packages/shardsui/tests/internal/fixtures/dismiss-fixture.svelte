<script lang="ts">
  import { dismiss, type DismissReason } from '$lib/internal/floating/dismiss.svelte'
  import { markOthers } from '$lib/internal/floating/mark-others'

  type Props = {
    escapeKey?: boolean
    outsidePress?: boolean | ((e: MouseEvent | TouchEvent) => boolean)
    triggerPress?: boolean
    bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean }
    outsidePressEvent?: 'intentional' | 'sloppy'
    markOutside?: boolean
    onDismiss?: (reason: DismissReason, event: Event) => void
  }

  let {
    escapeKey = true,
    outsidePress = true,
    triggerPress = false,
    bubbles = undefined,
    outsidePressEvent = 'sloppy',
    markOutside = false,
    onDismiss = undefined
  }: Props = $props()

  let open = $state(true)

  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  dismiss(() => ({
    open,
    onClose: (reason, event) => {
      onDismiss?.(reason, event)
      open = false
    },
    escapeKey,
    outsidePress,
    triggerPress,
    bubbles,
    outsidePressEvent,
    popupElement: popupElement,
    isInsideElement: (target) =>
      !!(triggerElement?.contains(target as Node) || popupElement?.contains(target as Node))
  }))

  $effect(() => {
    if (!markOutside || !popupElement) return
    return markOthers([popupElement])
  })
</script>

<div>
  <button data-testid="trigger" bind:this={triggerElement}>Toggle</button>
  {#if open}
    <div data-testid="popup" bind:this={popupElement} role="dialog">
      <input data-testid="inside-input" />
      <button
        type="button"
        data-testid="scrubber"
        onpointerdown={(event) => event.preventDefault()}
      >
        scrubber
      </button>
    </div>
  {/if}
  <div data-testid="outside">Outside element</div>
</div>
