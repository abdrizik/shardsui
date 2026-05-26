import { dataAttrs } from '$lib/internal/data-attrs'
import { Transition, type TransitionStatus } from '$lib/internal/transition-status.svelte'

export type CollapsibleState = {
  open: boolean
  disabled: boolean
  transitionStatus: TransitionStatus
}

type CollapsibleRootOptions = {
  open: boolean
  setOpen: (open: boolean) => void
  disabled: boolean
}

export class CollapsibleRoot {
  #options: () => CollapsibleRootOptions
  #transition: Transition

  panelId = $state<string | undefined>(undefined)

  open = $derived.by(() => this.#options().open)
  disabled = $derived.by(() => this.#options().disabled)
  mounted = $derived.by(() => this.#transition.mounted)
  transitionStatus = $derived.by(() => this.#transition.status)

  state: CollapsibleState = $derived({
    open: this.open,
    disabled: this.disabled,
    transitionStatus: this.transitionStatus
  })

  stateAttrs = $derived(
    dataAttrs({
      open: this.open,
      closed: !this.open,
      disabled: this.disabled
    })
  )

  constructor(options: () => CollapsibleRootOptions) {
    this.#options = options
    this.#transition = new Transition(() => ({
      open: this.open,
      idle: true
    }))
  }

  setOpen = (next: boolean) => {
    this.#options().setOpen(next)
  }

  toggle = () => {
    this.setOpen(!this.open)
  }

  setMounted = (next: boolean) => {
    this.#transition.mounted = next
  }
}
