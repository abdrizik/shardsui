import { dataAttrs } from '$lib/internal/data-attrs'
import type { FieldsetState } from './context'

type FieldsetRootOptions = {
  disabled: boolean
}

export class FieldsetRoot {
  #options: () => FieldsetRootOptions

  labelId = $state<string | undefined>()
  disabled = $derived.by(() => this.#options().disabled)
  state: FieldsetState = $derived({ disabled: this.disabled })
  stateAttrs = $derived(dataAttrs({ disabled: this.disabled }))

  constructor(options: () => FieldsetRootOptions) {
    this.#options = options
  }
}
