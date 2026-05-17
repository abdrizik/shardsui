import type { PopupTriggerMap } from './popup-trigger-map'

type TriggerRegistrationHost<Bindings> = {
  open: boolean
  mounted: boolean
  activeTriggerId: string | null
  setActiveTriggerId: (id: string | null) => void
  triggerElement: HTMLElement | null
  triggerElements: PopupTriggerMap<Bindings>
}

type TriggerRegistrationOptions<Bindings> = {
  id: string
  ref: HTMLElement | null
  root: TriggerRegistrationHost<Bindings>
}

export class TriggerRegistration<Bindings> {
  #options: () => TriggerRegistrationOptions<Bindings>
  #triggerBindings: () => Bindings
  #apply: (bindings: Bindings) => void

  #id = $derived.by(() => this.#options().id)
  #ref = $derived.by(() => this.#options().ref)
  #root = $derived.by(() => this.#options().root)

  isTriggerActive = $derived(this.#root.activeTriggerId === this.#id)
  isActiveOpen = $derived(this.#root.open && this.isTriggerActive)
  isMountedByThisTrigger = $derived(this.isTriggerActive && this.#root.mounted)

  constructor(
    options: () => TriggerRegistrationOptions<Bindings>,
    // Held as its own field rather than read through `options()`: the registration effect below
    // returns a cleanup, and a thunk re-created on every options() evaluation would re-run it each
    // render, interleaving unregister/register across siblings and dropping registrations.
    triggerBindings: () => Bindings,
    apply: (bindings: Bindings) => void
  ) {
    this.#options = options
    this.#triggerBindings = triggerBindings
    this.#apply = apply

    $effect(() => {
      const element = this.#ref
      const triggerId = this.#id
      if (!element) return

      return this.#root.triggerElements.add(triggerId, element, this.#triggerBindings)
    })

    $effect(() => {
      const element = this.#ref
      if (!element) return

      const root = this.#root
      const activeTriggerId = root.activeTriggerId
      const id = this.#id
      const open = root.open

      if (activeTriggerId === id) {
        root.triggerElement = element
        if (open) this.#apply(this.#triggerBindings())
      } else if (activeTriggerId == null && open) {
        root.setActiveTriggerId(id)
        root.triggerElement = element
        this.#apply(this.#triggerBindings())
      }
    })

    $effect.pre(() => {
      if (!this.isMountedByThisTrigger) return
      const element = this.#ref
      if (element) this.#root.triggerElement = element
      this.#apply(this.#triggerBindings())
    })
  }
}
