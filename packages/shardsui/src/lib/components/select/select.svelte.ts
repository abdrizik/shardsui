import { FieldContext } from '$lib/components/field/context'
import { FormContext } from '$lib/components/form/context'
import { areArraysEqual } from '$lib/internal/are-arrays-equal'
import { contains } from '$lib/internal/dom'
import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'
import { dismiss } from '$lib/internal/floating/dismiss.svelte'
import { compareItemEquality, type ItemEqualityComparer } from '$lib/internal/item-equality'
import { focusElementWithVisible } from '$lib/internal/label-interaction'
import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
import { OpenInteractionHandlers } from '$lib/internal/open-interaction-handlers.svelte'
import { REASONS, type ChangeEventReason } from '$lib/internal/reasons'
import {
  resolveSelectedLabel,
  stringifyAsLabel,
  stringifyAsValue
} from '$lib/internal/resolve-value-label'
import { getMaxScrollOffset, normalizeScrollOffset } from '$lib/internal/scroll-edges'
import { Transition } from '$lib/internal/transition-status.svelte'
import { watch } from '$lib/internal/watch.svelte'
import { untrack } from 'svelte'
import type { SelectItem } from './context'
import { SelectItemRegistry } from './item-registry.svelte'

type SelectRootOptions = {
  id: string
  value: unknown
  setValue: (value: unknown) => void
  onValueChange?: (value: unknown) => void
  open: boolean
  setOpen: (open: boolean) => void
  onOpenChange?: (open: boolean) => void
  onOpenChangeComplete?: (open: boolean) => void
  name: string | undefined
  disabled: boolean
  readOnly: boolean
  required: boolean
  modal: boolean
  multiple: boolean
  highlightItemOnHover: boolean
  items: readonly unknown[] | Record<string, unknown> | undefined
  isItemEqualToValue: ItemEqualityComparer
  itemToStringLabel: ((item: unknown) => string) | undefined
  itemToStringValue: ((item: unknown) => string) | undefined
}

export class SelectRoot {
  #options: () => SelectRootOptions

  triggerElement = $state<HTMLElement | null>(null)
  triggerFocusTargetElement = $state<HTMLElement | null>(null)
  hiddenInputElement = $state<HTMLInputElement | null>(null)
  positionerElement = $state<HTMLElement | null>(null)
  popupElement = $state<HTMLElement | null>(null)
  listElement = $state<HTMLElement | null>(null)
  listId = $state<string | undefined>(undefined)
  popupId = $state<string | undefined>(undefined)
  labelId = $state<string | undefined>(undefined)
  popupSide = $state<Side | null>(null)
  scrollUpArrowVisible = $state(false)
  scrollDownArrowVisible = $state(false)
  forceMount = $state(false)
  lastCloseEvent = $state<Event | null>(null)
  openChangeReason = $state<ChangeEventReason | null>(null)
  #scrollArrowsMountedCount = $state(0)

  typing = false
  isPointerModality = false
  #highlightSyncedOnOpen = false

  mouseUpSelection = {
    allowSelected: false,
    allowUnselected: false,
    dragY: 0
  }

  #field = FieldContext.getOr()
  #formRoot = FormContext.getOr()

  itemRegistry: SelectItemRegistry
  #transition: Transition
  openInteractionHandlers: OpenInteractionHandlers
  #initialValue: unknown

  value = $derived.by(() => {
    if (this.#options().value !== undefined) return this.#options().value
    return this.#options().multiple ? [] : null
  })

  selectedValues: unknown[] = $derived(Array.isArray(this.value) ? this.value : [])

  hasValue = $derived.by(() => {
    if (this.value == null) return false
    if (this.#options().multiple && Array.isArray(this.value)) {
      return this.selectedValues.length > 0
    }
    return stringifyAsValue(this.value, this.#options().itemToStringValue) !== ''
  })

  #fieldStringValue: unknown = $derived.by(() => {
    const value = this.value
    return this.#options().multiple && Array.isArray(value)
      ? value.map((entry) => this.serialize(entry))
      : this.serialize(value)
  })

  serializedValue = $derived.by((): string => {
    if (this.#options().multiple) {
      return ''
    }
    return this.serialize(this.value)
  })

  disabled = $derived.by(() => this.#field?.disabled || this.#options().disabled)

  resolvedName = $derived.by(() => this.#field?.name ?? this.#options().name)

  hiddenInputName = $derived.by(() => (this.#options().multiple ? undefined : this.resolvedName))

  selectedLabel = $derived.by(() => {
    const { items, itemToStringLabel } = this.#options()
    if (Array.isArray(this.value)) {
      return this.selectedValues
        .map((entry) => resolveSelectedLabel(entry, items, itemToStringLabel))
        .join(', ')
    }
    return resolveSelectedLabel(this.value, items, itemToStringLabel)
  })

  hasScrollArrows = $derived(this.#scrollArrowsMountedCount > 0)

  scroller = $derived(this.listElement ?? this.popupElement)

  open = $derived.by(() => this.#options().open)
  required = $derived.by(() => this.#options().required)
  readOnly = $derived.by(() => this.#options().readOnly)
  modal = $derived.by(() => this.#options().modal)
  multiple = $derived.by(() => this.#options().multiple)
  highlightItemOnHover = $derived.by(() => this.#options().highlightItemOnHover)
  items = $derived.by(() => this.#options().items)
  isItemEqualToValue = $derived.by(() => this.#options().isItemEqualToValue)
  onOpenChangeComplete = $derived.by(() => this.#options().onOpenChangeComplete)
  rootId = $derived.by(() => this.#options().id)

  mounted = $derived.by(() => this.#transition.mounted)
  transitionStatus = $derived.by(() => this.#transition.status)

  openMethod = $state<OpenInteractionHandlers['openMethod']>(null)

  constructor(options: () => SelectRootOptions) {
    this.#options = options

    this.itemRegistry = new SelectItemRegistry(() => ({
      isItemEqualToValue: this.#options().isItemEqualToValue,
      scroller: this.scroller
    }))
    this.#initialValue = this.value

    this.#transition = new Transition(() => ({ open: this.#options().open }))
    this.openInteractionHandlers = new OpenInteractionHandlers(() => ({
      open: this.#options().open
    }))

    watch(
      () => this.openInteractionHandlers.openMethod,
      (method) => {
        if (method !== null) this.openMethod = method
      }
    )

    this.#registerWithField()
    this.#syncFieldState()
    this.#closeOnDismiss()
    this.#unmountOnCloseComplete()
    this.#pruneValuesOfRemovedItems()
    this.#syncHighlightOnOpen()
  }

  #registerWithField(): void {
    $effect(() => {
      const field = this.#field
      if (!field || this.disabled) return
      return field.registerControl({
        id: `${this.rootId}-control`,
        element: () => this.triggerElement,
        validationElement: () => this.hiddenInputElement,
        value: () => this.value,
        formValue: () => this.#fieldStringValue,
        name: () => this.#options().name
      })
    })
  }

  #syncFieldState(): void {
    $effect(() => {
      if (!this.#field) return
      this.#field.filled = this.hasValue
    })

    watch(
      () => this.value,
      (value) => {
        this.#formRoot?.clearErrors(this.resolvedName)
        const field = this.#field
        if (!field) return
        field.setDirty(!this.#isSameValue(value, field.validityData.initialValue))
        field.commitValue(value)
      },
      { equals: this.#isSameValue }
    )
  }

  #unmountOnCloseComplete(): void {
    openChangeComplete(() => ({
      open: this.#options().open,
      element: this.popupElement,
      onComplete: () => {
        if (this.#options().open) return
        this.#transition.mounted = false
        this.itemRegistry.highlightedIndex = -1
        this.openMethod = null
        this.scrollUpArrowVisible = false
        this.scrollDownArrowVisible = false
        this.#options().onOpenChangeComplete?.(false)
      }
    }))
  }

  #closeOnDismiss(): void {
    dismiss(() => ({
      open: this.#options().open,
      onClose: (reason, event) => {
        const closeReason = reason === REASONS.escapeKey ? REASONS.escapeKey : REASONS.outsidePress
        this.setOpen(false, closeReason, event)
      },
      popupElement: this.positionerElement,
      referenceElement: this.triggerElement,
      isInsideElement: (target) =>
        contains(this.positionerElement, target) || contains(this.triggerElement, target)
    }))
  }

  #hasItemFor(value: unknown): boolean {
    return this.itemRegistry.items.some((item) =>
      compareItemEquality(item.value, value, this.#options().isItemEqualToValue)
    )
  }

  #pruneValuesOfRemovedItems(): void {
    watch(
      () => this.itemRegistry.count,
      (count, previousCount) => {
        if (count === 0 || previousCount === 0) return

        const value = this.value
        if (this.#options().multiple) {
          if (!Array.isArray(value)) return
          const remaining = value.filter((entry) => this.#hasItemFor(entry))
          if (remaining.length !== value.length) this.setValue(remaining)
          return
        }

        if (value == null || this.#hasItemFor(value)) return
        const hasInitial = this.#initialValue != null && this.#hasItemFor(this.#initialValue)
        this.setValue(hasInitial ? this.#initialValue : null)
      }
    )
  }

  #indexToHighlightOnOpen(): number {
    const value = untrack(() => this.value)
    if (this.multiple && Array.isArray(value)) {
      return this.itemRegistry.findByValue(value.at(-1))
    }
    return this.itemRegistry.findByValue(value)
  }

  #syncHighlightOnOpen(): void {
    $effect(() => {
      if (!this.open) {
        this.#highlightSyncedOnOpen = false
        return
      }
      if (this.#highlightSyncedOnOpen) return
      if (this.itemRegistry.count === 0) return

      const index = this.#indexToHighlightOnOpen()
      const fallback = this.highlightItemOnHover ? this.itemRegistry.firstIndex() : -1
      this.isPointerModality = false
      this.itemRegistry.highlightedIndex = index >= 0 ? index : fallback
      this.#highlightSyncedOnOpen = true
    })
  }

  serialize = (value: unknown): string => {
    return stringifyAsValue(value, this.#options().itemToStringValue)
  }

  #isSameValue = (a: unknown, b: unknown): boolean => {
    if (Array.isArray(a) && Array.isArray(b)) {
      return areArraysEqual(a, b, (itemValue, otherValue) =>
        compareItemEquality(itemValue, otherValue, this.#options().isItemEqualToValue)
      )
    }

    return a === b
  }

  setValue = (next: unknown): void => {
    this.#options().onValueChange?.(next)
    this.#options().setValue(next)
  }

  isValueSelected = (itemValue: unknown): boolean => {
    if (this.#options().multiple) {
      return this.selectedValues.some((selected) =>
        compareItemEquality(itemValue, selected, this.#options().isItemEqualToValue)
      )
    }
    return compareItemEquality(itemValue, this.value, this.#options().isItemEqualToValue)
  }

  setOpen = (next: boolean, reason?: ChangeEventReason, event?: Event): void => {
    if (this.disabled && next) return
    // A close immediately followed by an open collapses into one flush, so `#syncHighlightOnOpen`
    // never observes the closed state.
    if (!next) this.#highlightSyncedOnOpen = false
    this.#options().onOpenChange?.(next)
    this.lastCloseEvent = next ? null : (event ?? null)
    this.openChangeReason = reason ?? null
    this.#options().setOpen(next)
    if (!next && (reason === REASONS.outsidePress || reason === REASONS.focusOut)) {
      this.#field?.commitOnBlur(this.value)
    }
  }

  onfocus = (): void => {
    if (this.triggerElement) focusElementWithVisible(this.triggerElement)
  }

  #findItemMatchingAutofill(autofilledText: string): SelectItem | undefined {
    const target = autofilledText.toLowerCase()
    const byValueOrLabel = this.itemRegistry.items.find(
      (item) =>
        this.serialize(item.value).toLowerCase() === target ||
        stringifyAsLabel(item.value, this.#options().itemToStringLabel).toLowerCase() === target
    )
    if (byValueOrLabel) return byValueOrLabel

    const index = this.itemRegistry
      .labels()
      .findIndex((label) => label !== '' && label.toLowerCase() === target)
    return index === -1 ? undefined : this.itemRegistry.items[index]
  }

  onchange = (event: Event): void => {
    const input = this.hiddenInputElement
    if (!input) return
    if (
      event.defaultPrevented ||
      this.#options().disabled ||
      this.#options().readOnly ||
      this.#options().multiple
    ) {
      input.value = this.serializedValue
      return
    }

    const autofilledText = input.value
    this.forceMount = true
    queueMicrotask(() => {
      const matchingItem = this.#findItemMatchingAutofill(autofilledText)
      if (matchingItem) {
        this.setValue(matchingItem.value)
      } else {
        input.value = this.serializedValue
      }
    })
  }

  updateScrollArrowVisibility = (): void => {
    const scroller = this.scroller
    if (!scroller) return

    const maxScrollTop = getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight)
    const scrollTop = normalizeScrollOffset(scroller.scrollTop, maxScrollTop)

    this.scrollUpArrowVisible = scrollTop > 0
    this.scrollDownArrowVisible = scrollTop < maxScrollTop
  }

  registerScrollArrow = (): (() => void) => {
    untrack(() => {
      this.#scrollArrowsMountedCount += 1
    })
    return () => {
      this.#scrollArrowsMountedCount -= 1
    }
  }
}
