<script module lang="ts">
  // Opening the popup can place an item under the cursor: mouseup selection stays disabled this
  // long so releasing over an item doesn't commit an accidental selection.
  const MOUSE_UP_SELECTION_DELAY_MS = 400
  const OPEN_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Enter', ' '])
</script>

<script lang="ts">
  import type { Attachment } from 'svelte/attachments'
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import { contains } from '$lib/internal/dom'
  import { SelectContext, type SelectTriggerState } from './context'
  import { FieldContext } from '$lib/components/field/context'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import {
    getFieldAriaInvalid,
    getFieldState,
    getFieldStateAttrs
  } from '$lib/components/field/field.svelte'
  import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { ToolbarContext } from '$lib/components/toolbar/context'
  import { CompositeItem } from '$lib/internal/floating/composite.svelte'
  import { Timeout } from '$lib/internal/timeout'
  import { createTypeahead } from '$lib/internal/floating/typeahead.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import FocusGuard from '$lib/internal/focus-guard.svelte'
  import { TriggerFocusGuards } from '$lib/internal/floating/trigger-focus-guards.svelte'
  import { REASONS } from '$lib/internal/reasons'

  type Props = PartProps<[SelectTriggerState], 'button'> & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    id: idProp,
    disabled = false,
    tabindex: tabindexProp,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onfocus,
    onblur,
    onfocusout,
    'aria-describedby': ariaDescribedByProp,
    children,
    ...rest
  }: Props = $props()

  const select = SelectContext.get()
  const registry = select.itemRegistry
  const field = FieldContext.getOr()
  const labelable = LabelableContext.get()
  const id = $derived(idProp ?? select.rootId)
  const isDisabled = $derived(disabled || select.disabled)
  const ariaDescribedBy = $derived(mergeDescribedBy(ariaDescribedByProp, labelable.messageIds))

  const publishControlId: Attachment = () => labelable.registerControlId(id)

  const mouseUpSelectionTimeout = new Timeout()
  $effect(mouseUpSelectionTimeout.disposeEffect)
  const toolbar = ToolbarContext.getOr()

  const item = toolbar
    ? new CompositeItem(() => ({
        composite: toolbar.composite,
        ref,
        disabled: isDisabled
      }))
    : undefined

  $effect(() => {
    if (select.open) {
      mouseUpSelectionTimeout.start(MOUSE_UP_SELECTION_DELAY_MS, () => {
        select.mouseUpSelection.allowUnselected = true
        select.mouseUpSelection.allowSelected = true
      })

      return () => {
        mouseUpSelectionTimeout.clear()
      }
    }

    select.mouseUpSelection.allowSelected = false
    select.mouseUpSelection.allowUnselected = false
    select.mouseUpSelection.dragY = 0
  })

  const lastSelected = $derived(select.multiple ? select.selectedValues.at(-1) : select.value)
  const selectedIndex = $derived(
    select.multiple && select.selectedValues.length === 0 ? -1 : registry.findByValue(lastSelected)
  )
  const labels = $derived(registry.labels())

  const closedTypeahead = createTypeahead(() => ({
    enabled: !select.disabled && !select.readOnly && !select.multiple,
    items: labels,
    activeIndex: selectedIndex,
    selectedIndex: selectedIndex >= 0 ? selectedIndex : null,
    open: select.open,
    referenceElement: ref,
    floatingElement: select.positionerElement,
    // Native `<select>` skips disabled options while typing.
    isIndexDisabled: (index) => registry.isItemDisabled(index),
    onMatch: (index) => {
      const matched = registry.getValueAtIndex(index)
      if (matched === undefined) return
      select.setValue(matched)
    }
  }))

  const selectState = $derived({
    ...getFieldState(field),
    open: select.open,
    disabled: isDisabled,
    readOnly: select.readOnly,
    popupSide: select.popupSide,
    value: select.value,
    placeholder: !select.hasValue
  })

  const stateAttrs = $derived(
    dataAttrs({
      'popup-open': select.open,
      pressed: select.open,
      disabled: isDisabled,
      readonly: select.readOnly,
      placeholder: !select.hasValue,
      'popup-side': select.popupSide,
      ...getFieldStateAttrs(field)
    })
  )

  function toggleOpen(event: MouseEvent) {
    if (select.readOnly) return
    select.openInteractionHandlers.onclick(event)
    select.setOpen(!select.open, REASONS.triggerPress, event)
  }

  function openOnKey(event: KeyboardEvent) {
    if (select.readOnly) return
    if (OPEN_KEYS.has(event.key)) {
      event.preventDefault()
      if (!select.open) select.setOpen(true, REASONS.triggerPress, event)
    } else if (!select.open) {
      closedTypeahead.matchKey(event)
    }
  }

  function markFieldFocused() {
    if (field) field.focused = true
    select.forceMount = true
  }

  function commitFieldOnBlur(event: FocusEvent) {
    if (contains(select.positionerElement, event.relatedTarget)) return
    field?.commitOnBlur(select.value)
  }

  const guards = new TriggerFocusGuards(() => ({
    close: (event) => select.setOpen(false, REASONS.focusOut, event),
    positionerElement: select.positionerElement,
    popupElement: select.popupElement,
    triggerFocusTargetElement: select.triggerFocusTargetElement
  }))

  const btn = new Button(() => ({
    disabled: isDisabled,
    as,
    composite: !!toolbar,
    tabindex: tabindexProp,
    onclick: chain(onclick, toggleOpen),
    onmousedown,
    onkeydown: chain(onkeydown, openOnKey),
    onkeyup,
    onpointerdown: select.openInteractionHandlers.onpointerdown
  }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach attachElement((el) => (select.triggerElement = el))}
  {@attach btn.attach}
  {@attach publishControlId}
  {id}
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded={select.open}
  aria-controls={select.open ? (select.listId ?? select.popupId) : undefined}
  aria-labelledby={labelable.labelId ?? select.labelId}
  aria-required={select.required || undefined}
  aria-readonly={select.readOnly || undefined}
  aria-describedby={ariaDescribedBy}
  aria-invalid={getFieldAriaInvalid(field, isDisabled)}
  {...item ? { tabindex: item.tabindex } : {}}
  onfocus={chain(onfocus, item?.onfocus, markFieldFocused)}
  onblur={chain(onblur, commitFieldOnBlur)}
  onfocusout={chain(onfocusout, closedTypeahead.resetOnFocusLeave)}
  {...rest}
>
  {@render children?.(selectState)}
</svelte:element>
{#if select.open}
  <FocusGuard bind:ref={select.triggerFocusTargetElement} onfocus={guards.closeAndFocusAfter} />
{/if}
