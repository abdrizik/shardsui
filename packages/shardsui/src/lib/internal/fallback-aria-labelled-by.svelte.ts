type FallbackAriaLabelledByOptions = {
  element: HTMLInputElement | null
  elementId: string | undefined
  ariaLabelledBy: string | null | undefined
  labelId: string | undefined
}

export class FallbackAriaLabelledBy {
  #options: () => FallbackAriaLabelledByOptions

  #fallback = $state<string | undefined>(undefined)

  value = $derived.by(
    () => this.#options().ariaLabelledBy ?? this.#options().labelId ?? this.#fallback
  )

  constructor(options: () => FallbackAriaLabelledByOptions) {
    this.#options = options

    $effect(() => {
      const elementId = this.#options().elementId
      if (this.#options().ariaLabelledBy || this.#options().labelId || elementId === undefined) {
        this.#fallback = undefined
        return
      }

      const label = findAssociatedLabel(this.#options().element, elementId)
      if (!label) {
        this.#fallback = undefined
        return
      }

      if (!label.id && elementId) label.id = `${elementId}-label`
      this.#fallback = label.id || undefined
    })
  }
}

function findAssociatedLabel(
  input: HTMLInputElement | null,
  associatedId: string | undefined
): HTMLLabelElement | null {
  if (!input) return null
  const parent = input.parentElement
  if (parent?.tagName === 'LABEL') return parent as HTMLLabelElement
  if (associatedId) {
    const sibling = input.nextElementSibling as HTMLLabelElement | null
    if (sibling?.htmlFor === associatedId) return sibling
  }
  return input.labels?.[0] ?? null
}
