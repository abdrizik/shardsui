<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { chain } from '$lib/internal/chain'
  import { ComboboxContext, ComboboxPositionerContext, type ComboboxListState } from './context'
  import { attachElement } from '$lib/internal/attach-element'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { dataAttrs } from '$lib/internal/data-attrs'

  type Props = PartProps<[ComboboxListState], 'div', 'onkeydown'>

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  const combobox = ComboboxContext.get()
  const positioner = ComboboxPositionerContext.getOr()
  const registry = combobox.itemRegistry
  const direction = DirectionContext.get()
  const forwardArrowKey = $derived(direction.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')

  function registerListId() {
    combobox.listId = id
    return () => {
      combobox.listId = undefined
    }
  }

  function navigateList(event: KeyboardEvent) {
    if (combobox.disabled || combobox.readOnly) return
    if (event.key === 'Enter') {
      const activeIndex = registry.highlightedIndex
      if (activeIndex < 0) return
      event.preventDefault()
      event.stopPropagation()
      registry.getItemElement(activeIndex)?.click()
      return
    }

    if (!combobox.open) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      registry.moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
    } else if (combobox.grid && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault()
      event.stopPropagation()
      registry.focusItem(
        registry.stepIndex(registry.highlightedIndex, event.key === forwardArrowKey ? 1 : -1)
      )
    } else if (combobox.inputInsidePopup && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault()
      event.stopPropagation()
      registry.focusItem(event.key === 'Home' ? registry.firstIndex() : registry.lastIndex())
    }
  }

  const comboboxState: ComboboxListState = $derived({ empty: combobox.isEmpty })

  const stateAttrs = $derived(dataAttrs(comboboxState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (combobox.listElement = el))}
  {@attach !positioner && attachElement((el) => (combobox.positionerElement = el))}
  {@attach registerListId}
  {id}
  tabindex={-1}
  role={combobox.grid ? 'grid' : 'listbox'}
  aria-multiselectable={combobox.multiple || undefined}
  onkeydown={chain(onkeydown, navigateList)}
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
