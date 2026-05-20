import { untrack } from 'svelte'
import { createAnimationsFinished } from './animations-finished.svelte'
import type { Transition } from './transition-status.svelte'

type OpenChangeCompleteOptions = {
  enabled?: boolean
  open: boolean
  element: HTMLElement | null
  onComplete: () => void
}

export function openChangeComplete(options: () => OpenChangeCompleteOptions): void {
  const open = $derived(options().open)
  const enabled = $derived(options().enabled ?? true)

  const animationsFinished = createAnimationsFinished(() => ({
    waitForStartingStyleRemoved: open,
    element: options().element
  }))

  $effect(() => {
    if (!enabled) return
    // `onComplete` is typically an inline closure, so tracking it would abort and reschedule the
    // wait on every render and never settle.
    void open
    const controller = new AbortController()
    const onComplete = untrack(() => options().onComplete)
    animationsFinished.run(onComplete, controller.signal)
    return () => controller.abort()
  })
}

type OpenChangeCompleteCloseOptions = {
  open: boolean
  element: HTMLElement | null
  transition: Transition
  onOpenChangeComplete: ((open: boolean) => void) | undefined
  onClosed: () => void
}

export function openChangeCompleteClose(options: () => OpenChangeCompleteCloseOptions): void {
  const open = $derived(options().open)
  const transition = $derived(options().transition)

  openChangeComplete(() => ({
    enabled: transition.mounted && !open,
    open,
    element: options().element,
    onComplete: () => {
      if (!open) {
        transition.mounted = false
        options().onOpenChangeComplete?.(false)
        options().onClosed()
      }
    }
  }))
}
