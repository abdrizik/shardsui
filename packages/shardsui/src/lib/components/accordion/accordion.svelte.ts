import { CollapsibleRoot } from '$lib/components/collapsible/collapsible.svelte'
import { dataAttrs } from '$lib/internal/data-attrs'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'

export type AccordionRootState<Value = unknown> = {
  value: Value[]
  disabled: boolean
}

export type AccordionItemState<Value = unknown> = AccordionRootState<Value> & {
  hidden: boolean
  open: boolean
}

export type AccordionPanelState = AccordionItemState & {
  transitionStatus: TransitionStatus
}

type AccordionRootOptions<Value = unknown> = {
  value: Value[]
  setValue: (value: Value[]) => void
  disabled: boolean
  hiddenUntilFound: boolean
  keepMounted: boolean
  multiple: boolean
}

export class AccordionRoot<Value = unknown> {
  #options: () => AccordionRootOptions<Value>

  value = $derived.by(() => this.#options().value)
  disabled = $derived.by(() => this.#options().disabled)
  hiddenUntilFound = $derived.by(() => this.#options().hiddenUntilFound)
  keepMounted = $derived.by(() => this.#options().keepMounted)

  state: AccordionRootState<Value> = $derived({
    value: this.value,
    disabled: this.disabled
  })

  constructor(options: () => AccordionRootOptions<Value>) {
    this.#options = options
  }

  setItemOpen = (itemValue: Value, nextOpen: boolean) => {
    let next: Value[]
    if (!this.#options().multiple) {
      next = this.#options().value[0] === itemValue ? [] : [itemValue]
    } else if (nextOpen) {
      next = [...this.#options().value, itemValue]
    } else {
      next = this.#options().value.filter((existing) => existing !== itemValue)
    }

    this.#options().setValue(next)
  }
}

type AccordionItemOptions = {
  uid: string
  accordion: AccordionRoot
  value: unknown
  disabled: boolean
  onOpenChange?: (open: boolean) => void
}

export class AccordionItem {
  #options: () => AccordionItemOptions
  collapsible: CollapsibleRoot

  triggerId = $state<string | undefined>(undefined)

  value = $derived.by(() => this.#options().value ?? this.#options().uid)
  disabled = $derived.by(() => this.#options().disabled || this.#options().accordion.disabled)
  open = $derived.by(() => this.#options().accordion.value.includes(this.value))
  hidden = $derived.by(() => !this.open && !this.collapsible.mounted)

  state: AccordionItemState = $derived.by(() => ({
    value: this.#options().accordion.value,
    disabled: this.disabled,
    hidden: this.hidden,
    open: this.open
  }))

  stateAttrs = $derived(
    dataAttrs({
      disabled: this.disabled,
      open: this.open,
      closed: !this.open,
      hidden: this.hidden
    })
  )

  constructor(options: () => AccordionItemOptions) {
    this.#options = options
    this.collapsible = new CollapsibleRoot(() => ({
      open: this.open,
      setOpen: (next) => {
        this.#options().onOpenChange?.(next)
        this.#options().accordion.setItemOpen(this.value, next)
      },
      disabled: this.disabled
    }))
  }
}
