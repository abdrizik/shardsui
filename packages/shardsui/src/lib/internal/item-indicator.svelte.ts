import { dataAttrs } from '$lib/internal/data-attrs'
import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
import { Transition } from '$lib/internal/transition-status.svelte'

type ItemIndicatorOptions = {
  keepMounted: boolean
  element: HTMLElement | null
  open: boolean
}

export class ItemIndicator {
  #options: () => ItemIndicatorOptions
  #transition: Transition

  #open = $derived.by(() => this.#options().open)

  shouldRender = $derived.by(() => this.#options().keepMounted || this.#transition.mounted)
  transitionStatus = $derived.by(() => this.#transition.status)
  stateAttrs = $derived.by(() =>
    dataAttrs({
      'starting-style': this.#transition.status === 'starting',
      'ending-style': this.#transition.status === 'ending'
    })
  )

  constructor(options: () => ItemIndicatorOptions) {
    this.#options = options
    this.#transition = new Transition(() => ({ open: this.#open }))

    openChangeComplete(() => ({
      open: this.#open,
      element: this.#options().element,
      onComplete: () => {
        if (!this.#open) this.#transition.mounted = false
      }
    }))
  }
}
