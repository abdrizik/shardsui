<script lang="ts">
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { getTarget } from '$lib/internal/dom'
  import { findItemIndex } from '$lib/internal/item-equality'
  import { REASONS } from '$lib/internal/reasons'
  import { stringifyAsLabel } from '$lib/internal/resolve-value-label'
  import type { PartProps } from '$lib/internal/types'
  import { flushSync } from 'svelte'
  import {
    ComboboxContext,
    ComboboxRowContext,
    ComboboxItemContext,
    type ComboboxItemState
  } from './context'

  type Props = PartProps<[ComboboxItemState]> & {
    id?: never
    value?: unknown
    index?: number
    disabled?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    id: _id,
    value = null,
    index: indexProp,
    disabled = false,
    onclick,
    onkeydown,
    onkeyup,
    onmousedown,
    onmousemove,
    onmouseup,
    onpointerdown,
    onpointerleave,
    children,
    ...rest
  }: Props = $props()

  const combobox = ComboboxContext.get()
  const registry = combobox.itemRegistry
  const isInRow = ComboboxRowContext.get()
  const isDisabled = $derived(disabled || combobox.disabled)
  let didPointerDown = false

  $effect(() => {
    if (!combobox.open) didPointerDown = false
  })

  const resolvedVirtualIndex = $derived(
    indexProp ?? findItemIndex(combobox.flatFilteredItems, value, combobox.isItemEqualToValue)
  )

  const itemValue = $derived(value)

  $effect(() => {
    const element = ref
    if (!element) return
    if (combobox.virtualized) {
      const index = resolvedVirtualIndex
      if (index < 0) return
      return registry.registerVirtualItem(index, element)
    }
    return registry.registerItem(element, { value: itemValue, id: () => id })
  })

  const index = $derived.by(() => {
    if (indexProp != null) return indexProp
    if (combobox.virtualized) return resolvedVirtualIndex
    return ref ? registry.indexOf(ref) : -1
  })
  const selected = $derived(!combobox.noSelection && combobox.isValueSelected(value))
  const highlighted = $derived(registry.highlightedIndex === index && index >= 0)

  ComboboxItemContext.set({
    get selected() {
      return selected
    }
  })

  const id = $derived(index >= 0 ? `${combobox.rootId}-${index}` : undefined)

  function selectItem(domEvent: Event) {
    const targetEl = getTarget(domEvent) as HTMLElement | null
    const href = targetEl?.closest('a')?.getAttribute('href')
    if (href) {
      if (href.startsWith('#')) {
        combobox.setOpen(false, REASONS.itemPress)
      }
      return
    }
    combobox.selectValue(value)
    if (!combobox.multiple) {
      const fillsInput = combobox.noSelection
        ? combobox.popupElement !== null
        : !combobox.inputInsidePopup
      if (fillsInput) {
        combobox.setInputValue(
          stringifyAsLabel(value, combobox.itemToStringLabel),
          REASONS.itemPress
        )
      }
      combobox.setOpen(false, REASONS.itemPress)
    } else {
      const inputEl = combobox.inputElement as HTMLInputElement | null
      const wasFiltering = inputEl ? inputEl.value.trim() !== '' : false
      if (wasFiltering) {
        if (combobox.inputInsidePopup) {
          combobox.setInputValue('', REASONS.inputClear)
        } else {
          combobox.setOpen(false, REASONS.itemPress)
        }
      }
    }
    combobox.inputElement?.focus()
  }

  function commitSelection(event: MouseEvent) {
    if (combobox.submitOnItemClick) {
      // `requestSubmit` reads the form synchronously, so the hidden input must already carry the
      // new value.
      flushSync(() => {
        selectItem(event)
      })
      combobox.requestSubmit()
    } else {
      selectItem(event)
    }
  }

  function selectOnClick(event: MouseEvent) {
    if (combobox.readOnly) return
    commitSelection(event)
  }

  function highlightOnHover() {
    if (!isDisabled && index >= 0 && combobox.highlightItemOnHover) {
      registry.focusItem(index, 'pointer')
    }
  }

  function clearHighlightOnLeave() {
    if (combobox.keepHighlight) return
    if (registry.getItemElement(registry.highlightedIndex) !== ref) return
    registry.setHighlightedIndex(-1, 'pointer')
  }

  function preventFocusLoss(event: MouseEvent) {
    // iOS Safari can emit a synthetic mousedown for touch taps without a preceding
    // pointerdown. Prevent default here too so tapping an item does not blur the input.
    event.preventDefault()
  }

  function markPointerDown(event: PointerEvent) {
    if (event.isPrimary) didPointerDown = true
    event.preventDefault()
  }

  function selectOnMouseUp(event: MouseEvent) {
    const pointerStartedOnItem = didPointerDown
    didPointerDown = false

    if (
      isDisabled ||
      combobox.readOnly ||
      event.button !== 0 ||
      pointerStartedOnItem ||
      !highlighted
    ) {
      return
    }

    commitSelection(event)
  }

  const btn = new Button(() => ({
    disabled: isDisabled,
    focusableWhenDisabled: true,
    as,
    composite: true,
    onclick: chain(onclick, selectOnClick),
    onmousedown: chain(onmousedown, preventFocusLoss),
    onkeydown,
    onkeyup,
    onpointerdown: chain(onpointerdown, markPointerDown)
  }))

  const comboboxState: ComboboxItemState = $derived({ selected, highlighted, disabled: isDisabled })
  const stateAttrs = $derived(dataAttrs(comboboxState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {id}
  role={isInRow ? 'gridcell' : 'option'}
  aria-selected={combobox.noSelection ? undefined : selected}
  onmousemove={chain(onmousemove, highlightOnHover)}
  onmouseup={chain(onmouseup, selectOnMouseUp)}
  onpointerleave={chain(onpointerleave, clearHighlightOnLeave)}
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
