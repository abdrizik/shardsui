<script lang="ts">
  import type { Attachment } from 'svelte/attachments'
  import { chain } from '$lib/internal/chain'
  import { sortByDocumentPosition } from '$lib/internal/document-position'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { REASONS } from '$lib/internal/reasons'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { untrack } from 'svelte'
  import {
    ComboboxChipsContext,
    ComboboxContext,
    ComboboxChipContext,
    type ComboboxChipsContext as ComboboxChipsContextValue,
    type ComboboxChipState
  } from './context'

  type Props = PartProps<[ComboboxChipState]>

  let { as = 'div', ref = $bindable(null), onkeydown, children, ...rest }: Props = $props()

  const combobox = ComboboxContext.get()
  const chips = ComboboxChipsContext.getOr()
  const direction = DirectionContext.get()

  const registerChip: Attachment<HTMLElement> = (element) => {
    if (!chips) return
    const elements = chips.elements
    untrack(() => {
      const following = elements.findIndex((other) => sortByDocumentPosition(other, element) > 0)
      elements.splice(following === -1 ? elements.length : following, 0, element)
    })
    return () => {
      const i = elements.indexOf(element)
      if (i !== -1) elements.splice(i, 1)
    }
  }

  const index = $derived.by(() => {
    if (!ref || !chips) return -1
    return chips.elements.indexOf(ref)
  })

  const isRtl = $derived(direction.direction === 'rtl')
  const backwardArrowKey = $derived(isRtl ? 'ArrowRight' : 'ArrowLeft')
  const forwardArrowKey = $derived(isRtl ? 'ArrowLeft' : 'ArrowRight')

  function handleChipKey(
    event: KeyboardEvent,
    chips: ComboboxChipsContextValue
  ): number | undefined {
    if (event.key === backwardArrowKey) {
      event.preventDefault()
      return index > 0 ? index - 1 : undefined
    }
    if (event.key === forwardArrowKey) {
      event.preventDefault()
      return index < chips.elements.length - 1 ? index + 1 : undefined
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()
      event.stopPropagation()
      return combobox.removeSelectedValueAt(index)
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      return undefined
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      combobox.setOpen(true, REASONS.listNavigation)
      return undefined
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      return undefined
    }
    return index
  }

  function navigateChips(event: KeyboardEvent) {
    if (combobox.disabled || combobox.readOnly) return
    if (!chips) return

    const nextIndex = handleChipKey(event, chips)
    chips.highlightedIndex = nextIndex

    if (nextIndex === undefined) {
      combobox.inputElement?.focus()
    } else {
      chips.elements[nextIndex]?.focus()
    }
  }

  ComboboxChipContext.set({
    get index() {
      return index
    }
  })

  const comboboxState: ComboboxChipState = $derived({ disabled: combobox.disabled })

  const stateAttrs = $derived(dataAttrs(comboboxState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach registerChip}
  tabindex={-1}
  aria-disabled={combobox.disabled || undefined}
  aria-readonly={combobox.readOnly || undefined}
  onkeydown={chain(onkeydown, navigateChips)}
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
