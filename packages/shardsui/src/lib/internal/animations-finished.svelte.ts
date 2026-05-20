import { flushSync } from 'svelte'
import { on } from 'svelte/events'
import { AnimationFrame } from './animation-frame.svelte'

type AnimationsFinishedOptions = {
  element: HTMLElement | null
  waitForStartingStyleRemoved?: boolean
}

const STARTING_STYLE_ATTR = 'data-starting-style'

export function createAnimationsFinished(options: () => AnimationsFinishedOptions) {
  const frame = new AnimationFrame()
  let startingStyleObserver: MutationObserver | null = null

  function cancelPending(): void {
    frame.cancel()
    startingStyleObserver?.disconnect()
    startingStyleObserver = null
  }

  $effect(() => cancelPending)

  return {
    run: (fnToExecute: () => void, signal: AbortSignal | null = null): void => {
      cancelPending()

      const { element, waitForStartingStyleRemoved } = options()
      if (element == null) return

      function done() {
        flushSync(fnToExecute)
      }

      if (typeof element.getAnimations !== 'function' || globalThis.SHARDSUI_ANIMATIONS_DISABLED) {
        fnToExecute()
        return
      }

      const exec = () => {
        Promise.all(element.getAnimations().map((animation) => animation.finished)).then(
          () => {
            if (!signal?.aborted) {
              done()
            }
          },
          () => {
            if (signal?.aborted) return

            if (
              element
                .getAnimations()
                .some((animation) => animation.pending || animation.playState !== 'finished')
            ) {
              // An animation can be aborted because a property it depends on changes mid-play.
              exec()
              return
            }

            done()
          }
        )
      }

      if (waitForStartingStyleRemoved) {
        // One extra frame gives "open" animations a chance to be registered.
        if (!element.hasAttribute(STARTING_STYLE_ATTR)) {
          frame.request(exec)
          return
        }

        const attributeObserver = new MutationObserver(() => {
          if (!element.hasAttribute(STARTING_STYLE_ATTR)) {
            cancelPending()
            exec()
          }
        })

        startingStyleObserver = attributeObserver
        attributeObserver.observe(element, {
          attributes: true,
          attributeFilter: [STARTING_STYLE_ATTR]
        })
        if (signal) on(signal, 'abort', () => attributeObserver.disconnect(), { once: true })
        return
      }

      frame.request(exec)
    }
  }
}
