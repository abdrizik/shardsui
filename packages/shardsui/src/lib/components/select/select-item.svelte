<script lang="ts">
  import { isHTMLElement } from '@floating-ui/utils/dom'
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { contains } from '$lib/internal/dom'
  import { dataAttrs } from '$lib/internal/data-attrs'

  import { isVirtualClick } from '$lib/internal/floating/event'
  import { removeItem } from '$lib/internal/item-equality'
  import { REASONS } from '$lib/internal/reasons'
  import { SelectContext, SelectItemContext, type SelectItemState } from './context'

  type Props = PartProps<
    [SelectItemState],
    'div',
    | 'onclick'
    | 'onkeydown'
    | 'onkeyup'
    | 'onmousemove'
    | 'onmouseup'
    | 'onpointerdown'
    | 'onpointerenter'
    | 'onpointerleave'
    | 'onpointermove'
  > & {
    id?: never
    value?: unknown
    disabled?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value = null,
    disabled = false,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerenter,
    onpointermove,
    onpointerdown,
    onmouseup,
    onmousemove,
    onpointerleave,
    children,
    ...rest
  }: Props = $props()

  const select = SelectContext.get()
  const registry = select.itemRegistry
  const isDisabled = $derived(disabled || select.disabled)
  let pointerType: 'mouse' | 'touch' | 'pen' = 'mouse'
  let allowMouseSelection = false

  const itemValue = $derived(value)

  $effect(() => {
    if (!ref) return
    return registry.registerItem(ref, { value: itemValue })
  })

  const index = $derived(ref ? registry.indexOf(ref) : -1)
  const selected = $derived(select.isValueSelected(itemValue))
  const highlighted = $derived(registry.highlightedIndex === index && index >= 0)

  SelectItemContext.set({
    get selected() {
      return selected
    }
  })

  function commitSelection(event: Event) {
    if (select.disabled || select.readOnly) return
    if (select.multiple) {
      select.setValue(
        selected
          ? removeItem(select.selectedValues, itemValue, select.isItemEqualToValue)
          : [...select.selectedValues, itemValue]
      )
    } else {
      select.setValue(itemValue)
      select.setOpen(false, REASONS.itemPress, event)
    }
  }

  function highlightOnKeyDown(event: KeyboardEvent) {
    registry.highlightedIndex = index

    if (event.key === ' ' && select.typing) {
      event.preventDefault()
    }
  }

  function isBlockedMouseClick(event: MouseEvent) {
    if (pointerType === 'touch') return false
    const isActivatingVirtualClick =
      isVirtualClick(event) && ((event as PointerEvent).pointerType !== undefined || highlighted)
    return !isActivatingVirtualClick && !allowMouseSelection
  }

  function selectOnClick(event: MouseEvent) {
    // Safari leaves focus where it was when a non-button element is clicked.
    ref?.focus({ preventScroll: true })

    const blockedMouseClick = isBlockedMouseClick(event)
    allowMouseSelection = false

    if (blockedMouseClick) return

    commitSelection(event)
  }

  function trackPointerType(event: PointerEvent) {
    pointerType = event.pointerType as 'mouse' | 'touch' | 'pen'
  }

  function trackDragDistance(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || event.buttons !== 1) return

    const selection = select.mouseUpSelection
    selection.dragY += event.movementY
    if (selection.dragY ** 2 >= 64) selection.allowUnselected = true
  }

  function beginMouseSelection(event: PointerEvent) {
    pointerType = event.pointerType as 'mouse' | 'touch' | 'pen'
    allowMouseSelection = true
    select.mouseUpSelection.dragY = 0
  }

  function selectOnMouseUp() {
    select.mouseUpSelection.dragY = 0

    if (isDisabled || pointerType === 'touch') return
    if (allowMouseSelection) return

    const allowed = selected
      ? select.mouseUpSelection.allowSelected
      : select.mouseUpSelection.allowUnselected
    if (!allowed) return

    allowMouseSelection = true
    ref?.click()
    allowMouseSelection = false
  }

  function highlightOnHover() {
    if (isDisabled || !select.highlightItemOnHover || index < 0) return
    if (registry.highlightedIndex === index) return
    select.isPointerModality = true
    registry.highlightedIndex = index
  }

  function clearHighlightOnLeave(event: PointerEvent) {
    if (!select.open || !select.isPointerModality || event.pointerType === 'touch') return
    if (!select.highlightItemOnHover) return

    const relatedTarget = event.relatedTarget
    if (isHTMLElement(relatedTarget) && registry.indexOf(relatedTarget) !== -1) return

    registry.highlightedIndex = -1

    const popup = select.popupElement
    if (!popup) return
    if (contains(popup, popup.ownerDocument.activeElement)) {
      popup.focus({ preventScroll: true })
    }
  }

  const btn = new Button(() => ({
    disabled: isDisabled,
    as,
    composite: true,
    focusableWhenDisabled: true,
    onclick: chain(onclick, selectOnClick),
    onmousedown,
    onkeydown: chain(onkeydown, highlightOnKeyDown),
    onkeyup,
    onpointerdown: chain(onpointerdown, beginMouseSelection)
  }))

  const selectState: SelectItemState = $derived({ selected, highlighted, disabled: isDisabled })
  const stateAttrs = $derived(dataAttrs(selectState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  role="option"
  aria-selected={selected}
  tabindex={select.open && highlighted ? 0 : -1}
  onpointerenter={chain(onpointerenter, trackPointerType)}
  onpointermove={chain(onpointermove, trackDragDistance)}
  onmouseup={chain(onmouseup, selectOnMouseUp)}
  onmousemove={chain(onmousemove, highlightOnHover)}
  onpointerleave={chain(onpointerleave, clearHighlightOnLeave)}
  {...rest}
>
  {@render children?.(selectState)}
</svelte:element>
