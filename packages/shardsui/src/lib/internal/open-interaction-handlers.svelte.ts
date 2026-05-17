import { isIOS } from './detect-browser'
import { watchPre } from './watch.svelte'

type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | ''

type OpenInteractionHandlersOptions = {
  open: boolean
}

export class OpenInteractionHandlers {
  #options: () => OpenInteractionHandlersOptions

  openMethod = $state<InteractionType | null>(null)

  #lastPointerType: InteractionType = ''

  #open = $derived.by(() => this.#options().open)

  constructor(options: () => OpenInteractionHandlersOptions) {
    this.#options = options

    watchPre(
      () => this.#open,
      (current, previous) => {
        if (previous && !current) this.openMethod = null
      }
    )
  }

  #setOpenMethod(interactionType: InteractionType): void {
    if (!this.#open) {
      this.openMethod =
        interactionType ||
        // On iOS Safari, the hitslop around touch targets means tapping outside an element's
        // bounds does not fire `pointerdown` but does fire `mousedown`. The `interactionType`
        // will be "" in that case.
        (isIOS ? 'touch' : '')
    }
  }

  onpointerdown = (event: PointerEvent): void => {
    if (event.defaultPrevented) {
      return
    }

    this.#lastPointerType = (event.pointerType as InteractionType) || ''
    this.#setOpenMethod(event.pointerType as InteractionType)
  }

  onclick = (event: MouseEvent): void => {
    if (event.detail === 0) {
      this.#setOpenMethod('keyboard')
      return
    }

    if ('pointerType' in event) {
      this.#setOpenMethod(((event as PointerEvent).pointerType as InteractionType) || '')
    } else {
      this.#setOpenMethod(this.#lastPointerType)
    }
    this.#lastPointerType = ''
  }
}
