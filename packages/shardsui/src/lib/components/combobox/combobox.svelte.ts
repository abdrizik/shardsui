import { FieldContext } from '$lib/components/field/context'
import { FormContext } from '$lib/components/form/context'
import { areArraysEqual } from '$lib/internal/are-arrays-equal'
import { contains } from '$lib/internal/dom'
import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'
import {
  compareItemEquality,
  findItemIndex,
  type ItemEqualityComparer
} from '$lib/internal/item-equality'
import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
import { OpenInteractionHandlers } from '$lib/internal/open-interaction-handlers.svelte'
import { REASONS, type ChangeEventReason } from '$lib/internal/reasons'
import {
  isGroupedItems,
  stringifyAsLabel,
  stringifyAsValue,
  type Group
} from '$lib/internal/resolve-value-label'
import { isScrollable } from '$lib/internal/scrollable'
import { Transition } from '$lib/internal/transition-status.svelte'
import { watch, watchPre } from '$lib/internal/watch.svelte'
import { getOverflowAncestors, isHTMLElement } from '@floating-ui/utils/dom'
import { tick, untrack } from 'svelte'
import { ComboboxFilter } from './filter.svelte'
import { ComboboxItemRegistry, type HighlightReason } from './item-registry.svelte'

type ComboboxRootOptions = {
  id: string
  value: unknown
  setValue: (value: unknown) => void
  onValueChange?: (value: unknown) => void
  inputValue: string | undefined
  setInputValue: (value: string) => void
  onInputValueChange?: (value: string) => void
  open: boolean
  setOpen: (next: boolean) => void
  onOpenChange?: (open: boolean) => void
  onOpenChangeComplete?: (open: boolean) => void
  name: string | undefined
  form: string | undefined
  disabled: boolean
  readOnly: boolean
  required: boolean
  modal: boolean
  loopFocus: boolean
  grid: boolean
  isItemEqualToValue: ItemEqualityComparer
  selectionMode: 'single' | 'multiple' | 'none' | undefined
  openOnInputClick: boolean
  autoHighlight: boolean | 'always'
  highlightItemOnHover: boolean
  keepHighlight: boolean
  onItemHighlighted?: (highlightedValue: unknown, reason: HighlightReason, index: number) => void
  itemToStringValue: ((item: unknown) => string) | undefined
  itemToStringLabel: ((item: unknown) => string) | undefined
  items: readonly unknown[] | readonly Group<unknown>[] | undefined
  filteredItems: readonly unknown[] | readonly Group<unknown>[] | undefined
  filter:
    | null
    | ((item: unknown, query: string, itemToString?: (item: unknown) => string) => boolean)
    | undefined
  limit: number
  locale: Intl.LocalesArgument
  inline: boolean
  autoComplete: 'list' | 'both' | 'inline' | 'none'
  submitOnItemClick: boolean
  virtualized: boolean
}

// Autofill omits `inputType` in Chrome and reports `insertReplacementText` in Firefox.
export function isTypedInput(event: Event | undefined): boolean {
  if (!event) return true
  if (event.type === 'compositionend') return true
  const inputType = event instanceof InputEvent ? event.inputType : undefined
  return inputType != null && inputType !== '' && inputType !== 'insertReplacementText'
}

export class ComboboxRoot {
  #options: () => ComboboxRootOptions

  #field = FieldContext.getOr()
  #formRoot = FormContext.getOr()

  inputElement = $state<HTMLElement | null>(null)
  hiddenInputElement = $state<HTMLInputElement | null>(null)
  triggerElement = $state<HTMLElement | null>(null)
  clearElement = $state<HTMLElement | null>(null)
  chipsContainerElement = $state<HTMLElement | null>(null)
  inputGroupElement = $state<HTMLElement | null>(null)
  startDismissElement = $state<HTMLElement | null>(null)
  endDismissElement = $state<HTMLElement | null>(null)
  inputInsidePopup = $state(true)
  positionerElement = $state<HTMLElement | null>(null)
  popupElement = $state<HTMLElement | null>(null)
  listElement = $state<HTMLElement | null>(null)
  emptyElement = $state<HTMLElement | null>(null)
  listId = $state<string | undefined>(undefined)
  popupId = $state<string | undefined>(undefined)
  labelId = $state<string | undefined>(undefined)
  popupSide = $state<Side | null>(null)
  forceMount = $state(false)
  openChangeReason = $state<ChangeEventReason | null>(null)
  lastCloseEvent = $state<Event | null>(null)

  #queryChangedAfterOpen = $state(false)
  #closeQuery = $state<string | null>(null)
  pendingOpenHighlight: 'first' | 'last' | null = null
  #pendingQueryHighlight = $state.raw<{ hasQuery: boolean; bySelection?: boolean } | null>(null)
  #selectionSeed = $state.raw<{ value: unknown } | null>(null)

  #internalInputValue = $state<string>('')
  #initialInputValue = ''
  #hadInputClear = false

  #transition: Transition
  openInteractionHandlers: OpenInteractionHandlers
  #filtering: ComboboxFilter
  itemRegistry: ComboboxItemRegistry

  multiple = $derived.by(() => this.#options().selectionMode === 'multiple')
  noSelection = $derived.by(() => this.#options().selectionMode === 'none')
  inputOwnsFormValue = $derived.by(
    () => this.noSelection && (this.#options().inline || !this.inputInsidePopup)
  )
  selectedValues: unknown[] = $derived.by(() => {
    const value = this.#options().value
    return Array.isArray(value) ? value : []
  })
  #animatedElement = $derived.by(() => {
    const positioner = this.positionerElement
    if (this.#options().inline && positioner) {
      return positioner.closest<HTMLElement>('[role="dialog"]')
    }
    return this.popupElement
  })

  #seedValue = $derived.by(() =>
    this.multiple ? this.selectedValues[this.selectedValues.length - 1] : this.#options().value
  )
  hasSelectedValue = $derived.by(() =>
    this.multiple ? this.selectedValues.length > 0 : this.#options().value != null
  )
  showsPlaceholder = $derived(!this.noSelection && !this.hasSelectedValue)
  #fieldStringValue: unknown = $derived.by(() => {
    if (this.noSelection) return this.inputValue
    const value = this.#options().value
    return Array.isArray(value)
      ? value.map((entry) => this.serialize(entry))
      : this.serialize(value)
  })
  serializedValue = $derived.by(() => {
    if (this.noSelection) return this.inputValue
    const value = this.#options().value
    return Array.isArray(value) ? '' : this.serialize(value)
  })
  inputValue = $derived.by(() => {
    const inputValueProp = this.#options().inputValue
    if (inputValueProp === undefined) return this.#internalInputValue
    return inputValueProp ?? ''
  })
  hasInputValue = $derived.by(() => this.#options().inputValue !== undefined)
  open = $derived.by(() => this.#options().open)

  mounted = $derived.by(() => this.#transition.mounted)
  transitionStatus = $derived.by(() => this.#transition.status)
  openMethod = $derived.by(() => this.openInteractionHandlers.openMethod)

  rootId = $derived.by(() => this.#options().id)
  name = $derived.by(() => this.#field?.name ?? this.#options().name)
  disabled = $derived.by(() => this.#options().disabled || (this.#field?.disabled ?? false))
  hasItems = $derived.by(() => this.#options().items !== undefined)

  #flatItems = $derived.by((): readonly unknown[] => {
    const itemsProp = this.#options().items
    if (!itemsProp) return []
    if (isGroupedItems(itemsProp)) {
      return itemsProp.flatMap((g) => g.items)
    }
    return itemsProp
  })

  #typeaheadValues = $derived.by((): readonly unknown[] =>
    this.hasItems ? this.#flatItems : this.itemRegistry.items.map((item) => item.value)
  )

  #rawQuery = $derived(this.inputValue.trim())

  computedFilteredItems = $derived.by(() => this.#filtering.computedFilteredItems)
  flatFilteredItems = $derived.by(() => this.#filtering.flatFilteredItems)

  focusItemOnOpen = $derived.by(
    () => !(this.#queryChangedAfterOpen || (this.noSelection && !this.#options().autoHighlight))
  )

  isEmpty = $derived.by(() => this.itemRegistry.count === 0)

  escapeKeyBubbles = $derived(
    this.hasItems && this.flatFilteredItems.length === 0 && this.emptyElement === null
  )

  grid = $derived.by(() => this.#options().grid)
  form = $derived.by(() => this.#options().form)
  onOpenChangeComplete = $derived.by(() => this.#options().onOpenChangeComplete)
  readOnly = $derived.by(() => this.#options().readOnly)
  required = $derived.by(() => this.#options().required)
  modal = $derived.by(() => this.#options().modal)
  focusManagerModal = $derived.by(() => !this.inputInsidePopup || this.#options().modal)
  openOnInputClick = $derived.by(() => this.#options().openOnInputClick)
  submitOnItemClick = $derived.by(() => this.#options().submitOnItemClick)
  autoHighlight = $derived.by(() => this.#options().autoHighlight)
  highlightItemOnHover = $derived.by(() => this.#options().highlightItemOnHover)
  keepHighlight = $derived.by(() => this.#options().keepHighlight)
  itemToStringLabel = $derived.by(() => this.#options().itemToStringLabel)
  isItemEqualToValue = $derived.by(() => this.#options().isItemEqualToValue)
  inline = $derived.by(() => this.#options().inline)
  autoComplete = $derived.by(() => this.#options().autoComplete)
  virtualized = $derived.by(() => this.#options().virtualized)
  items = $derived.by(() => this.#options().items)

  value = $derived.by(() => this.#options().value)

  constructor(options: () => ComboboxRootOptions) {
    this.#options = options

    this.#transition = new Transition(() => ({ open: this.open }))
    this.openInteractionHandlers = new OpenInteractionHandlers(() => ({ open: this.open }))

    this.#filtering = new ComboboxFilter(() => ({
      locale: this.#options().locale,
      filteredItems: this.#options().filteredItems,
      filter: this.#options().filter,
      limit: this.#options().limit,
      items: this.#options().items,
      hasItems: this.hasItems,
      flatItems: this.#flatItems,
      rawQuery: this.#rawQuery,
      itemToStringLabel: this.#options().itemToStringLabel,
      multiple: this.multiple,
      noSelection: this.noSelection,
      currentValue: this.#options().value,
      queryChangedAfterOpen: this.#queryChangedAfterOpen,
      closeQuery: this.#closeQuery
    }))

    this.itemRegistry = new ComboboxItemRegistry(() => ({
      loopFocus: this.#options().loopFocus,
      autoHighlight: this.#options().autoHighlight,
      virtualized: this.#options().virtualized,
      grid: this.#options().grid,
      itemCount: this.flatFilteredItems.length,
      container: this.listElement ?? this.popupElement
    }))

    const initial =
      !this.multiple && !this.noSelection
        ? stringifyAsLabel(this.#options().value ?? null, this.#options().itemToStringLabel)
        : ''
    this.#internalInputValue = initial
    this.#initialInputValue = this.hasInputValue ? '' : initial
    if (this.#options().inline) this.#selectionSeed = { value: this.#seedValue }

    $effect(() => {
      const field = this.#field
      if (!field || this.disabled) return
      return field.registerControl({
        id: `${this.rootId}-control`,
        element: () => (this.inputInsidePopup ? this.triggerElement : this.inputElement),
        validationElement: () => this.hiddenInputElement,
        value: () => (this.noSelection ? this.inputValue : this.#options().value),
        formValue: () => this.#fieldStringValue,
        name: () => this.#options().name
      })
    })

    $effect(() => {
      const field = this.#field
      if (!field) return
      field.filled = this.noSelection ? this.inputValue !== '' : this.hasSelectedValue
    })

    watchPre(
      () => this.#closeQuery ?? this.#rawQuery,
      (query) => {
        if (!this.open || query === '' || query === this.#initialInputValue) return
        this.#queryChangedAfterOpen = true
      }
    )

    // Runs after the DOM flush so the hidden validation input already carries the new value when
    // the field reads its native validity.
    watch(
      () => this.#options().value,
      (value) => {
        if (this.noSelection) return
        this.#formRoot?.clearErrors(this.name)
        this.#field?.setDirty(this.#isSelectedValueDirty(value))
        this.#field?.commitValue(value)

        if (!this.multiple && !this.hasInputValue && !this.inputInsidePopup) {
          this.#syncInputToSelectedLabel(value)
        }
      }
    )

    watch(
      () => this.inputValue,
      (inputValue) => {
        if (!this.noSelection) return
        this.#formRoot?.clearErrors(this.name)
        const field = this.#field
        if (!field) return
        field.setDirty(inputValue !== field.validityData.initialValue)
        field.commitValue(inputValue)
      }
    )

    watch(
      () => this.#options().items,
      () => {
        if (
          this.multiple ||
          this.noSelection ||
          this.hasInputValue ||
          this.inputInsidePopup ||
          this.#queryChangedAfterOpen
        ) {
          return
        }
        this.#syncInputToSelectedLabel(this.#options().value)
      }
    )

    openChangeComplete(() => ({
      open: this.open,
      element: this.#animatedElement,
      onComplete: () => {
        if (!this.open) {
          this.#completeCloseUnmount()
        }
      }
    }))

    // Must land in the same flush as the query that caused it, and before the highlight is
    // reported below — hence declared first.
    watch(
      () => ({ pending: this.#pendingQueryHighlight, inputValue: this.inputValue }),
      ({ pending }) => {
        if (!pending) return

        if (pending.hasQuery) {
          if (this.#options().autoHighlight && this.#isListNavigable()) {
            this.itemRegistry.setHighlightedIndex(0, 'none')
          }
          this.#pendingQueryHighlight = null
          return
        }

        if (this.inputValue.trim() !== '') return

        this.#pendingQueryHighlight = null
        if (!this.#isListNavigable()) return

        this.#restoreHighlightAfterQueryCleared(pending.bySelection === true)
      }
    )

    watch(
      () => {
        const index = this.itemRegistry.highlightedIndex
        if (!this.mounted && !this.#options().inline) {
          return { index: -1, value: undefined, resolved: true }
        }
        if (index < 0) return { index: -1, value: undefined, resolved: true }
        if (this.#options().virtualized) {
          return {
            index,
            value: this.flatFilteredItems[index],
            resolved: index < this.flatFilteredItems.length
          }
        }
        const item = this.itemRegistry.items[index]
        return { index, value: item?.value, resolved: item !== undefined }
      },
      ({ value, index }) =>
        this.#options().onItemHighlighted?.(value, this.itemRegistry.lastHighlightReason, index),
      {
        equals: (current, previous) =>
          !current.resolved ||
          (previous.index === current.index &&
            compareItemEquality(current.value, previous.value, this.#options().isItemEqualToValue))
      }
    )

    $effect(() => {
      if (this.open || this.noSelection) return
      this.#selectionSeed = { value: this.#seedValue }
    })

    $effect(() => {
      const open = this.open
      const autoHighlightProp = this.autoHighlight
      if (!open) return
      if (!autoHighlightProp && this.noSelection) return
      // Items register in their own effect, so the first run of this one sees an empty registry
      // and bails; the read below re-runs it once they are in.
      void this.itemRegistry.items
      untrack(() => {
        if (this.itemRegistry.count === 0) return
        const seed = this.#selectionSeed
        this.#selectionSeed = null
        const seedIndex = seed ? this.findVisibleIndex(seed.value) : -1
        if (seedIndex >= 0) {
          this.itemRegistry.setHighlightedIndex(seedIndex, 'none')
        } else if (autoHighlightProp === 'always') {
          if (this.itemRegistry.highlightedIndex < 0) {
            this.itemRegistry.setHighlightedIndex(this.itemRegistry.firstIndex(), 'none')
          }
        } else if (this.pendingOpenHighlight && !this.#queryChangedAfterOpen) {
          const openIndex =
            this.pendingOpenHighlight === 'first'
              ? this.itemRegistry.firstIndex()
              : this.itemRegistry.stepIndex(this.itemRegistry.count, -1)
          if (openIndex !== -1) this.itemRegistry.setHighlightedIndex(openIndex, 'none')
        }
        this.pendingOpenHighlight = null
      })
    })
  }

  #isListNavigable(): boolean {
    return this.open || this.#options().inline || this.positionerElement?.hidden === false
  }

  #restoreHighlightAfterQueryCleared(clearedBySelection: boolean): void {
    if (this.#options().autoHighlight === 'always' && !clearedBySelection && this.noSelection) {
      this.itemRegistry.setHighlightedIndex(0, 'none')
    }

    void tick().then(() => {
      if (!this.open && !this.#options().inline) return
      const input = this.inputElement as HTMLInputElement | null
      if (input && input.value.trim() !== '') return

      const seed = this.#seedValue
      const hasSelection = !this.noSelection && seed != null

      if (hasSelection || clearedBySelection) {
        this.itemRegistry.setHighlightedIndex(
          hasSelection ? this.findVisibleIndex(seed) : -1,
          'none'
        )
      } else if (this.#options().autoHighlight === 'always') {
        this.itemRegistry.setHighlightedIndex(this.itemRegistry.firstIndex(), 'none')
      }
    })
  }

  findVisibleIndex = (value: unknown): number => {
    const isItemEqualToValue = this.#options().isItemEqualToValue
    if (this.#options().virtualized) {
      return findItemIndex(this.flatFilteredItems, value, isItemEqualToValue)
    }
    return this.itemRegistry.items.findIndex((item) =>
      compareItemEquality(item.value, value, isItemEqualToValue)
    )
  }

  #scrollListToTop(): void {
    const list = this.listElement
    if (this.#options().virtualized || !list) return

    const popup = this.popupElement
    for (const ancestor of getOverflowAncestors(list.firstElementChild ?? list)) {
      if (
        !isHTMLElement(ancestor) ||
        (popup ? !contains(popup, ancestor) : ancestor.getAttribute('role') === 'dialog')
      ) {
        break
      }
      if (isScrollable(ancestor, 'vertical')) {
        ancestor.scrollTop = 0
        break
      }
    }
  }

  #isSelectedValueDirty(value: unknown): boolean {
    const initialValue = this.#field?.validityData.initialValue

    if (Array.isArray(value) && Array.isArray(initialValue)) {
      return !areArraysEqual(value, initialValue, (itemValue, initialItemValue) =>
        compareItemEquality(itemValue, initialItemValue, this.#options().isItemEqualToValue)
      )
    }

    return value !== initialValue
  }

  #syncInputToSelectedLabel(value: unknown): void {
    const nextInputValue = stringifyAsLabel(value, this.#options().itemToStringLabel)
    if (nextInputValue !== this.inputValue) {
      this.setInputValue(nextInputValue, REASONS.none)
    }
  }

  #rewriteInputElement(next: string, reason: ChangeEventReason): void {
    const input = this.inputElement as HTMLInputElement | null
    if (input && input.value !== next) this.setInputValue(next, reason)
  }

  #completeCloseUnmount(): void {
    this.#transition.mounted = false
    this.itemRegistry.setHighlightedIndex(-1)
    this.#options().onOpenChangeComplete?.(false)

    this.#queryChangedAfterOpen = false
    this.#closeQuery = null

    if (this.noSelection) return

    if (this.multiple) {
      if (!this.#hadInputClear) this.#rewriteInputElement('', REASONS.inputClear)
      return
    }

    if (this.inputInsidePopup) {
      this.#rewriteInputElement('', REASONS.inputClear)
      return
    }

    const label = stringifyAsLabel(this.#options().value, this.#options().itemToStringLabel)
    this.#rewriteInputElement(label, label === '' ? REASONS.inputClear : REASONS.none)
  }

  serialize = (value: unknown): string => stringifyAsValue(value, this.#options().itemToStringValue)

  #findSerializedMatch(autofilledText: string): unknown {
    const target = autofilledText.toLowerCase()
    return this.flatFilteredItems.find(
      (candidate) => this.serialize(candidate).toLowerCase() === target
    )
  }

  #findAutofillValue(autofilledText: string): unknown {
    const target = autofilledText.toLowerCase()
    const itemToStringLabel = this.#options().itemToStringLabel
    const candidates = this.hasItems
      ? this.flatFilteredItems
      : this.itemRegistry.items.map((item) => item.value)
    const match = candidates.find(
      (candidate) =>
        this.serialize(candidate).toLowerCase() === target ||
        stringifyAsLabel(candidate, itemToStringLabel).toLowerCase() === target
    )
    if (match != null) return match

    return this.itemRegistry.items.find((item) => {
      const renderedLabel = item.element.textContent?.trim() ?? ''
      return renderedLabel !== '' && renderedLabel.toLowerCase() === target
    })?.value
  }

  commitAutofilledValue = (event: Event): void => {
    const input = this.hiddenInputElement
    if (!input) return
    if (event.defaultPrevented || this.disabled || this.readOnly || this.multiple) {
      input.value = this.serializedValue
      return
    }

    const autofilledText = input.value
    // Chrome fires both `input` and `change` for one autofill, so the second arrives with the
    // value already applied.
    if (autofilledText === this.serializedValue) return

    if (this.noSelection) {
      this.setInputValue(autofilledText, REASONS.none)
      return
    }

    if (!this.hasItems || this.#findSerializedMatch(autofilledText) == null) {
      this.forceMount = true
    }
    queueMicrotask(() => {
      const match = this.#findAutofillValue(autofilledText)
      if (match != null) this.setValue(match)
      else input.value = this.serializedValue
    })
  }

  requestSubmit = (): void => {
    const form =
      this.hiddenInputElement?.form ?? (this.inputElement as HTMLInputElement | null)?.form
    if (typeof form?.requestSubmit === 'function') form.requestSubmit()
  }

  setValue = (next: unknown): void => {
    this.#options().onValueChange?.(next)
    this.#options().setValue(next)
  }

  selectValue = (itemValue: unknown): void => {
    if (this.noSelection) return
    if (!this.multiple) {
      this.setValue(itemValue)
      return
    }
    const isItemEqualToValue = this.#options().isItemEqualToValue
    const idx = this.selectedValues.findIndex((selected) =>
      compareItemEquality(itemValue, selected, isItemEqualToValue)
    )
    const next =
      idx >= 0
        ? [...this.selectedValues.slice(0, idx), ...this.selectedValues.slice(idx + 1)]
        : [...this.selectedValues, itemValue]
    this.setValue(next)
  }

  /** Returns the chip index that should be highlighted next. */
  removeSelectedValueAt = (index: number): number | undefined => {
    const next = index >= this.selectedValues.length - 1 ? this.selectedValues.length - 2 : index
    this.itemRegistry.setHighlightedIndex(-1)
    this.setValue(this.selectedValues.filter((_, i) => i !== index))
    return next >= 0 ? next : undefined
  }

  isValueSelected = (itemValue: unknown): boolean => {
    const isItemEqualToValue = this.#options().isItemEqualToValue
    if (this.multiple) {
      return this.selectedValues.some((selected) =>
        compareItemEquality(itemValue, selected, isItemEqualToValue)
      )
    }
    return compareItemEquality(itemValue, this.#options().value, isItemEqualToValue)
  }

  setInputValue = (
    next: string,
    reason: ChangeEventReason = REASONS.inputChange,
    event?: Event
  ): void => {
    this.#hadInputClear = reason === REASONS.inputClear
    this.#options().onInputValueChange?.(next)
    if (this.noSelection) this.#formRoot?.clearErrors(this.name)
    if (this.#options().inputValue !== undefined) this.#options().setInputValue(next)
    else this.#internalInputValue = next

    if (reason === REASONS.inputChange) {
      if (this.open && this.#closeQuery !== null) this.#closeQuery = null

      if (isTypedInput(event)) {
        const hasQuery = next.trim() !== ''
        if (hasQuery) {
          this.#queryChangedAfterOpen = true
        }
        this.#pendingQueryHighlight = { hasQuery }
        this.#scrollListToTop()
      }
    } else if (reason === REASONS.inputClear && next === '' && this.inputInsidePopup) {
      this.#pendingQueryHighlight = { hasQuery: false, bySelection: true }
    }
  }

  setOpen = (next: boolean, reason?: ChangeEventReason, event?: Event): void => {
    if (this.disabled && next) return
    if (this.open === next) return
    this.#options().onOpenChange?.(next)
    this.openChangeReason = reason ?? null
    this.lastCloseEvent = next ? null : (event ?? null)
    this.#options().setOpen(next)
    if (!next) {
      this.pendingOpenHighlight = null

      if (this.#queryChangedAfterOpen) {
        const query = this.#rawQuery
        const single = !this.multiple && !this.noSelection
        const inline = this.#options().inline
        if (single) {
          if (!inline) this.#closeQuery = query
          if (query === '') this.#queryChangedAfterOpen = false
        } else if (this.multiple) {
          if (!inline) this.#closeQuery = query
          if (this.inputInsidePopup) this.itemRegistry.setHighlightedIndex(-1)
          if (!this.inputInsidePopup || inline) {
            this.setInputValue('', REASONS.inputClear)
          }
        }
      }
    } else if (this.inputInsidePopup && !this.#options().inline && this.#closeQuery !== null) {
      this.#queryChangedAfterOpen = false
      this.#closeQuery = null
      if (this.inputValue !== '' && reason !== REASONS.inputChange) {
        this.setInputValue('', REASONS.inputClear)
      }
    }

    if (
      !next &&
      this.inputInsidePopup &&
      (reason === REASONS.focusOut || reason === REASONS.outsidePress)
    ) {
      this.#field?.commitOnBlur(this.noSelection ? this.inputValue : this.#options().value)
    }
  }

  itemLabels = (): Array<string | undefined> => {
    const itemToStringLabel = this.#options().itemToStringLabel
    if (this.hasItems) {
      return this.#flatItems.map((item) => stringifyAsLabel(item, itemToStringLabel))
    }
    return this.itemRegistry.items.map(
      (item) => item.element.textContent?.trim() || stringifyAsLabel(item.value, itemToStringLabel)
    )
  }

  findByValue = (value: unknown): number => {
    return findItemIndex(this.#typeaheadValues, value, this.#options().isItemEqualToValue)
  }

  getValueAtIndex = (index: number): unknown => {
    return this.#typeaheadValues[index]
  }
}
