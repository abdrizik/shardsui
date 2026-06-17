<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { ComboboxContext, type ComboboxTriggerState } from './context'
  import { FieldContext } from '$lib/components/field/context'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import {
    getFieldAriaInvalid,
    getFieldState,
    getFieldStateAttrs
  } from '$lib/components/field/field.svelte'
  import { attachElement } from '$lib/internal/attach-element'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { Timeout } from '$lib/internal/timeout'
  import { createTypeahead } from '$lib/internal/floating/typeahead.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { REASONS } from '$lib/internal/reasons'
  import { getTarget, contains } from '$lib/internal/dom'
  import { isMouseWithinBounds } from '$lib/internal/pseudo-element-bounds'
  import { on } from 'svelte/events'

  type Props = PartProps<[ComboboxTriggerState], 'button'> & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    id: idProp,
    disabled = false,
    onclick,
    onkeydown,
    onkeyup,
    onfocus,
    onblur,
    onfocusout,
    onmousedown,
    onpointerdown,
    onpointerenter,
    children,
    ...rest
  }: Props = $props()

  const combobox = ComboboxContext.get()
  const field = FieldContext.getOr()
  const labelable = LabelableContext.get()
  const id = $derived(combobox.inputInsidePopup ? (idProp ?? combobox.rootId) : idProp)

  const isDisabled = $derived(disabled || combobox.disabled)

  let currentPointerType = ''

  const ariaControls = $derived.by(() => {
    if (!combobox.open) return undefined
    if (combobox.inputInsidePopup) return combobox.popupId ?? `${combobox.rootId}-popup`
    return combobox.listId
  })

  const ariaLabelledBy = $derived(labelable.labelId ?? combobox.labelId)

  const selectedIdx = $derived(combobox.findByValue(combobox.value))
  const labels = $derived(combobox.itemLabels())

  const closedTypeahead = createTypeahead(() => ({
    enabled:
      !combobox.open &&
      !combobox.readOnly &&
      !isDisabled &&
      !combobox.multiple &&
      !combobox.noSelection,
    items: labels,
    activeIndex: selectedIdx,
    selectedIndex: selectedIdx >= 0 ? selectedIdx : null,
    open: combobox.open,
    referenceElement: combobox.inputInsidePopup ? ref : combobox.inputElement,
    floatingElement: combobox.positionerElement,
    onMatch: (index) => {
      const matched = combobox.getValueAtIndex(index)
      if (matched === undefined) return
      combobox.setValue(matched)
    }
  }))

  function markFieldFocused() {
    if (field) field.focused = true
  }

  const focusTimeout = new Timeout()
  $effect(focusTimeout.disposeEffect)

  function forceMountItems() {
    if (isDisabled || combobox.readOnly) return
    if (!combobox.hasItems) combobox.forceMount = true
  }

  function forceMountItemsOnFocus() {
    focusTimeout.start(0, forceMountItems)
  }

  function commitFieldOnBlur(event: FocusEvent) {
    if (contains(combobox.positionerElement, event.relatedTarget as Node | null)) return

    field?.commitOnBlur(combobox.noSelection ? combobox.inputValue : combobox.value)
  }

  function toggleOpen(event: MouseEvent) {
    if (combobox.readOnly) return
    combobox.openInteractionHandlers.onclick(event)
    combobox.setOpen(!combobox.open, REASONS.triggerPress)
  }

  function trackPointerType(event: PointerEvent) {
    currentPointerType = event.pointerType
  }

  function focusInputFromTrigger(event: MouseEvent) {
    if (isDisabled || combobox.readOnly) return

    forceMountItems()

    if (currentPointerType !== 'touch') {
      combobox.inputElement?.focus()
      if (!combobox.inputInsidePopup) {
        event.preventDefault()
      }
    }

    if (combobox.open) return

    if (combobox.inputInsidePopup) {
      const doc = ref?.ownerDocument ?? document
      function onmouseup(mouseEvent: MouseEvent) {
        const element = ref
        if (!element) return
        const positioner = combobox.positionerElement
        const target = getTarget(mouseEvent) as Element | null

        if (
          contains(element, target) ||
          contains(positioner, target) ||
          contains(combobox.listElement, target)
        ) {
          return
        }

        if (isMouseWithinBounds(mouseEvent, element)) return

        combobox.setOpen(false, REASONS.cancelOpen)
      }
      on(doc, 'mouseup', onmouseup, { once: true })
    }
  }

  function openOnKey(event: KeyboardEvent) {
    if (combobox.readOnly) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      combobox.setOpen(true, REASONS.listNavigation)
      combobox.inputElement?.focus()
      return
    }
    closedTypeahead.matchKey(event)
  }

  const btn = new Button(() => ({
    disabled: isDisabled,
    as,
    tabindex: combobox.inputInsidePopup ? 0 : -1,
    onclick: chain(onclick, toggleOpen),
    onmousedown: chain(onmousedown, focusInputFromTrigger),
    onkeydown: chain(onkeydown, openOnKey),
    onkeyup,
    onpointerdown: chain(
      onpointerdown,
      trackPointerType,
      combobox.openInteractionHandlers.onpointerdown
    )
  }))

  const comboboxState: ComboboxTriggerState = $derived({
    ...getFieldState(field),
    open: combobox.open,
    disabled: isDisabled,
    popupSide: combobox.popupSide,
    listEmpty: combobox.isEmpty,
    placeholder: combobox.showsPlaceholder
  })

  const stateAttrs = $derived(
    dataAttrs({
      'popup-open': combobox.open,
      pressed: combobox.open,
      disabled: isDisabled,
      'popup-side': combobox.popupSide ?? undefined,
      'list-empty': combobox.isEmpty,
      placeholder: combobox.showsPlaceholder,
      ...getFieldStateAttrs(field)
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach attachElement((el) => (combobox.triggerElement = el))}
  {@attach btn.attach}
  {id}
  role={combobox.inputInsidePopup ? 'combobox' : undefined}
  aria-haspopup={combobox.inputInsidePopup ? 'dialog' : 'listbox'}
  aria-expanded={combobox.open}
  aria-controls={ariaControls}
  aria-required={combobox.inputInsidePopup ? combobox.required || undefined : undefined}
  aria-invalid={getFieldAriaInvalid(field, isDisabled)}
  aria-labelledby={ariaLabelledBy}
  onfocus={chain(onfocus, markFieldFocused, forceMountItemsOnFocus)}
  onblur={chain(onblur, commitFieldOnBlur)}
  onfocusout={chain(onfocusout, closedTypeahead.resetOnFocusLeave)}
  onpointerenter={chain(onpointerenter, trackPointerType)}
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
