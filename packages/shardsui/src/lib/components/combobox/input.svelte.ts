import { FieldContext } from '$lib/components/field/context'
import { isAndroid, isGecko } from '$lib/internal/detect-browser'
import { DirectionContext } from '$lib/internal/direction-context'
import { LabelableContext } from '$lib/internal/labelable-context'
import { REASONS } from '$lib/internal/reasons'
import { untrack } from 'svelte'
import type { Attachment } from 'svelte/attachments'
import { isTypedInput, type ComboboxRoot } from './combobox.svelte'
import { ComboboxChipsContext, ComboboxPositionerContext } from './context'

type ComboboxInputOptions = {
  ref: HTMLElement | null
  id: string | undefined
  uid: string
  disabled: boolean
}

export class ComboboxInput {
  #combobox: ComboboxRoot
  #field = FieldContext.getOr()
  #labelable = LabelableContext.get()
  #chips = ComboboxChipsContext.getOr()
  #direction = DirectionContext.get()
  #insidePositioner = ComboboxPositionerContext.getOr() != null
  #options: () => ComboboxInputOptions

  #isComposing = false
  #composingValue = $state<string | null>(null)
  #highlightToRestore: number | null = null

  insidePopup = $derived.by(() => this.#insidePositioner || this.#combobox.inline)

  id = $derived.by(
    () =>
      this.#options().id ??
      (!this.insidePopup ? this.#combobox.rootId : undefined) ??
      this.#options().uid
  )

  disabled = $derived.by(() => this.#options().disabled || this.#combobox.disabled)

  highlightedItemId = $derived.by(() => {
    const registry = this.#combobox.itemRegistry
    return registry.highlightedIndex < 0 ? undefined : registry.getItemId(registry.highlightedIndex)
  })

  #inputElement = $derived.by(() => this.#options().ref as HTMLInputElement | null)

  #rtl = $derived.by(() => this.#direction.direction === 'rtl')
  #backwardArrowKey = $derived(this.#rtl ? 'ArrowRight' : 'ArrowLeft')
  #forwardArrowKey = $derived(this.#rtl ? 'ArrowLeft' : 'ArrowRight')

  constructor(combobox: ComboboxRoot, options: () => ComboboxInputOptions) {
    this.#combobox = combobox
    this.#options = options

    $effect(() => {
      combobox.inputInsidePopup = this.insidePopup
      return () => {
        combobox.inputInsidePopup = true
      }
    })
  }

  publishControlId: Attachment = () => this.#labelable.registerControlId(this.id)

  registerInputElement: Attachment<HTMLElement> = (element) => {
    const combobox = this.#combobox
    combobox.inputElement = element
    untrack(() => {
      if (this.insidePopup && !combobox.hasInputValue) combobox.setInputValue('', REASONS.none)
    })
    return () => {
      combobox.inputElement = null
    }
  }

  syncValue: Attachment<HTMLInputElement | HTMLTextAreaElement> = (node) => {
    const next = this.#composingValue ?? this.#combobox.inputValue
    if (node.value !== next) node.value = next
  }

  oncompositionstart = (): void => {
    // Android with some keyboards (e.g. Samsung with predictive text on) reports all text as
    // always-composing, so composition state can't gate anything there.
    if (isAndroid) return
    this.#isComposing = true
    this.#composingValue = this.#inputElement?.value ?? null
  }

  oncompositionend = (event: CompositionEvent): void => {
    this.#isComposing = false
    const next = this.#inputElement?.value ?? ''
    this.#composingValue = null
    this.#combobox.setInputValue(next, REASONS.inputChange, event)
  }

  onfocus = (): void => {
    const combobox = this.#combobox
    if (this.#field) this.#field.focused = true

    if (combobox.inline && this.#highlightToRestore != null) {
      const index = this.#highlightToRestore
      this.#highlightToRestore = null
      if (index < combobox.flatFilteredItems.length) {
        combobox.itemRegistry.setHighlightedIndex(index)
      }
    }
  }

  onclick = (event: MouseEvent): void => {
    const combobox = this.#combobox
    combobox.openInteractionHandlers.onclick(event)
    if (!this.disabled && !combobox.readOnly && combobox.openOnInputClick) combobox.setOpen(true)
  }

  onblur = (): void => {
    const combobox = this.#combobox

    const registry = combobox.itemRegistry
    const activeIndex = registry.highlightedIndex
    if (combobox.inline && activeIndex >= 0 && combobox.autoHighlight !== 'always') {
      this.#highlightToRestore = activeIndex
      registry.setHighlightedIndex(-1)
    }

    this.#field?.commitOnBlur(combobox.noSelection ? combobox.inputValue : combobox.value)
  }

  oninput = (event: Event): void => {
    const combobox = this.#combobox
    const registry = combobox.itemRegistry
    const composing = this.#isComposing
    const canOpen = !this.disabled && !combobox.readOnly && (composing || isTypedInput(event))
    const next = this.#inputElement?.value ?? ''

    if (composing) {
      this.#composingValue = next
    } else {
      combobox.setInputValue(next, REASONS.inputChange, event)

      if (
        next === '' &&
        !combobox.multiple &&
        !combobox.noSelection &&
        !combobox.inputInsidePopup
      ) {
        combobox.setValue(null)
      }
    }

    if (next.trim() !== '' && canOpen && !combobox.open) {
      combobox.setOpen(true, REASONS.inputChange)
    } else if (next === '' && !combobox.openOnInputClick && !combobox.inputInsidePopup) {
      combobox.setOpen(false, REASONS.inputClear)
    }

    const keepsHighlight = combobox.autoHighlight && (!composing || next.trim() !== '')
    if (combobox.open && registry.highlightedIndex !== -1 && !keepsHighlight) {
      registry.setHighlightedIndex(-1)
    }
  }

  #focusChip(chips: ComboboxChipsContext, index: number | undefined): void {
    chips.highlightedIndex = index
    if (index !== undefined) chips.elements[index]?.focus()
  }

  #enterChipsFromInput(event: KeyboardEvent, chips: ComboboxChipsContext): boolean {
    if (event.key !== this.#backwardArrowKey) return false
    if ((this.#inputElement?.selectionStart ?? 0) !== 0) return false
    if (this.#combobox.selectedValues.length === 0) return false

    event.preventDefault()
    const { elements } = chips
    this.#focusChip(chips, elements.length > 0 ? elements.length - 1 : undefined)
    return true
  }

  #navigateChips(event: KeyboardEvent, chips: ComboboxChipsContext, index: number): boolean {
    if (event.key === this.#backwardArrowKey) {
      event.preventDefault()
      this.#focusChip(chips, index > 0 ? index - 1 : undefined)
      return true
    }
    if (event.key === this.#forwardArrowKey) {
      event.preventDefault()
      this.#focusChip(chips, index < chips.elements.length - 1 ? index + 1 : undefined)
      return true
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()
      const chipCount = this.#combobox.selectedValues.length
      const nextIndex = index >= chipCount - 1 ? chipCount - 2 : index
      this.#combobox.itemRegistry.setHighlightedIndex(-1)
      this.#focusChip(chips, nextIndex >= 0 ? nextIndex : undefined)
      return true
    }
    return false
  }

  #consumedByChips(event: KeyboardEvent): boolean {
    const chips = this.#chips
    if (!chips) return false
    const highlightedIndex = chips.highlightedIndex
    if (highlightedIndex === undefined) return this.#enterChipsFromInput(event, chips)
    return this.#navigateChips(event, chips, highlightedIndex)
  }

  onkeydown = (event: KeyboardEvent): void => {
    const combobox = this.#combobox
    const registry = combobox.itemRegistry
    const chips = this.#chips
    const inputEl = this.#inputElement!

    if (this.disabled || combobox.readOnly) return

    if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return

    if (this.#consumedByChips(event)) return

    if (
      chips &&
      event.key === 'Backspace' &&
      combobox.multiple &&
      inputEl.value === '' &&
      combobox.selectedValues.length > 0
    ) {
      const chipsCount = chips.elements.length
      const removalIndex = chipsCount > 0 ? chipsCount - 1 : combobox.selectedValues.length - 1
      combobox.removeSelectedValueAt(removalIndex)
    }

    if (event.isComposing && event.key.startsWith('Arrow')) return

    if (
      combobox.grid &&
      registry.highlightedIndex >= 0 &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    ) {
      event.preventDefault()
      if (!combobox.open) return
      const dir = event.key === this.#forwardArrowKey ? 1 : -1
      registry.focusItem(registry.stepIndex(registry.highlightedIndex, dir))
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!combobox.open) {
        combobox.pendingOpenHighlight = 'first'
        combobox.setOpen(true, REASONS.listNavigation)
        // Items only register once the popup mounts, so there is nothing to move to yet.
        if (combobox.focusItemOnOpen && combobox.itemRegistry.count === 0)
          registry.setHighlightedIndex(0)
      }
      registry.moveHighlight(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!combobox.open) {
        combobox.pendingOpenHighlight = 'last'
        combobox.setOpen(true, REASONS.listNavigation)
      }
      registry.moveHighlight(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      event.stopPropagation()
      const cursor = isGecko && this.#rtl ? inputEl.value.length : 0
      inputEl.setSelectionRange(cursor, cursor)
      inputEl.scrollLeft = 0
    } else if (event.key === 'End') {
      event.preventDefault()
      event.stopPropagation()
      const scrollAmount = inputEl.scrollWidth - inputEl.clientWidth
      const cursor = isGecko && this.#rtl ? 0 : inputEl.value.length
      inputEl.setSelectionRange(cursor, cursor)
      inputEl.scrollLeft = this.#rtl ? -scrollAmount : scrollAmount
    } else if (event.key === 'Enter') {
      if (event.isComposing) return
      if (combobox.open) {
        if (registry.highlightedIndex < 0) {
          if (!combobox.inline) combobox.setOpen(false, REASONS.none)
          return
        }
        event.preventDefault()
        event.stopPropagation()
        registry.getItemElement(registry.highlightedIndex)?.click()
      }
    } else if (event.key === 'Escape') {
      if (combobox.open) {
        combobox.setOpen(false, REASONS.escapeKey)
        // The dismiss listener sits on the document, so by the time it could stop propagation
        // the event has already passed every ancestor. Only the input is early enough.
        if (!combobox.inline && !combobox.escapeKeyBubbles) event.stopPropagation()
      } else if (!combobox.mounted) {
        const isClear = combobox.multiple ? !combobox.hasSelectedValue : combobox.value === null

        combobox.setInputValue('', REASONS.escapeKey)
        if (!combobox.noSelection) combobox.setValue(combobox.multiple ? [] : null)
        if (!isClear && !combobox.inline) event.stopPropagation()
      }
    }
  }
}
