import { flushSync } from 'svelte'
import { AnimationFrame } from './animation-frame.svelte'
import { createAnimationsFinished } from './animations-finished.svelte'
import { watchPre } from './watch.svelte'

type Offset = {
  horizontal: number
  vertical: number
}

type PopupViewportOptions = {
  activeTrigger: Element | null
  currentContainer: HTMLElement | null
  activeTriggerId: string | null
  open: boolean
  mounted: boolean
}

export class PopupViewport {
  previousNode = $state<HTMLElement | null>(null)
  previousContentDimensions = $state.raw<{ width: number; height: number } | null>(null)
  showStartingStyle = $state(false)

  #triggerOffset = $state.raw<Offset | null>(null)

  #capturedNode: HTMLElement | null = null
  #lastHandledTrigger: Element | null = null
  #cleanupController: AbortController | null = null

  #options: () => PopupViewportOptions
  #cleanupFrame = new AnimationFrame()
  #animationsFinished = createAnimationsFinished(() => ({
    element: this.#currentContainer,
    waitForStartingStyleRemoved: true
  }))

  #activeTrigger = $derived.by(() => this.#options().activeTrigger)
  #activeTriggerId = $derived.by(() => this.#options().activeTriggerId)
  #currentContainer = $derived.by(() => this.#options().currentContainer)
  #open = $derived.by(() => this.#options().open)
  #mounted = $derived.by(() => this.#options().mounted)

  activationDirection = $derived(getActivationDirection(this.#triggerOffset))
  transitioning = $derived(this.previousNode != null)
  contentKey = $derived(this.#activeTriggerId ?? this.#activeTrigger?.id ?? 'current')

  constructor(options: () => PopupViewportOptions) {
    this.#options = options
    $effect(this.#cleanupFrame.disposeEffect)

    $effect.pre(() => {
      if (!this.#open || !this.#mounted) {
        this.#lastHandledTrigger = null
      }
    })

    watchPre(
      () => (this.#open ? this.#activeTrigger : null),
      (_, previousActiveTrigger) => {
        const activeTrigger = this.#activeTrigger
        const captured = this.#capturedNode

        if (
          activeTrigger &&
          previousActiveTrigger &&
          activeTrigger !== previousActiveTrigger &&
          this.#lastHandledTrigger !== activeTrigger &&
          captured
        ) {
          const offset = calculateRelativePosition(previousActiveTrigger, activeTrigger)

          this.previousNode = captured
          this.#triggerOffset = offset
          this.showStartingStyle = true

          this.#lastHandledTrigger = activeTrigger
        }
      }
    )

    $effect.pre(() => {
      void this.contentKey

      if (this.previousNode == null) return

      this.#cleanupController?.abort()

      this.showStartingStyle = true

      this.#cleanupFrame.request(() => {
        flushSync(() => {
          this.showStartingStyle = false
        })
        const controller = new AbortController()
        this.#cleanupController = controller
        this.#animationsFinished.run(() => {
          this.previousNode = null
          this.previousContentDimensions = null
          this.#capturedNode = null
        }, controller.signal)
      })
    })

    $effect(() => {
      const currentContainer = this.#currentContainer
      void this.previousNode

      if (!currentContainer) return

      const wrapper = currentContainer.ownerDocument.createElement('div')
      for (const child of Array.from(currentContainer.childNodes)) {
        wrapper.appendChild(child.cloneNode(true))
      }
      this.#capturedNode = wrapper
    })
  }
}

/** Px a trigger's centre must move before the shift counts as directional rather than incidental. */
const DIRECTION_TOLERANCE_PX = 5

function getActivationDirection(offset: Offset | null): string | undefined {
  if (!offset) return undefined
  const horizontal = labelDirection(offset.horizontal, 'right', 'left')
  const vertical = labelDirection(offset.vertical, 'down', 'up')
  return `${horizontal} ${vertical}`
}

function labelDirection(value: number, positiveLabel: string, negativeLabel: string): string {
  if (value > DIRECTION_TOLERANCE_PX) return positiveLabel
  if (value < -DIRECTION_TOLERANCE_PX) return negativeLabel
  return ''
}

function calculateRelativePosition(from: Element, to: Element): Offset {
  const fromRect = from.getBoundingClientRect()
  const toRect = to.getBoundingClientRect()
  const fromCenter = {
    x: fromRect.left + fromRect.width / 2,
    y: fromRect.top + fromRect.height / 2
  }
  const toCenter = {
    x: toRect.left + toRect.width / 2,
    y: toRect.top + toRect.height / 2
  }
  return {
    horizontal: toCenter.x - fromCenter.x,
    vertical: toCenter.y - fromCenter.y
  }
}
