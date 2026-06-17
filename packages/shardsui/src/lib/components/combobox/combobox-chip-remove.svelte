<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { ComboboxChipContext, ComboboxContext, type ComboboxChipRemoveState } from './context'

  type Props = PartProps<[ComboboxChipRemoveState], 'button'> & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    disabled = false,
    onclick,
    onkeydown,
    onkeyup,
    onmousedown,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const combobox = ComboboxContext.get()
  const registry = combobox.itemRegistry
  const chip = ComboboxChipContext.get()

  const isDisabled = $derived(disabled || combobox.disabled)
  const buttonDisabled = $derived(isDisabled || combobox.readOnly)

  function removeChip() {
    const removedItem = combobox.selectedValues[chip.index]
    const activeIndex = registry.highlightedIndex
    if (activeIndex >= 0) {
      const removedIndex = combobox.findVisibleIndex(removedItem)
      if (removedIndex !== -1 && activeIndex === removedIndex) {
        registry.setHighlightedIndex(-1)
      }
    }
    combobox.setValue(combobox.selectedValues.filter((_, i) => i !== chip.index))
    combobox.inputElement?.focus()
  }

  function removeOnClick(event: MouseEvent) {
    removeChip()
    event.stopPropagation()
  }

  function preventFocusLoss(event: MouseEvent) {
    event.preventDefault()
  }

  function removeOnKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      removeChip()
    }
  }

  const btn = new Button(() => ({
    disabled: buttonDisabled,
    focusableWhenDisabled: true,
    as,
    tabindex: -1,
    onclick: chain(onclick, removeOnClick),
    onmousedown: chain(onmousedown, preventFocusLoss),
    onkeydown: chain(onkeydown, removeOnKey),
    onkeyup,
    onpointerdown
  }))

  const comboboxState: ComboboxChipRemoveState = $derived({ disabled: isDisabled })

  const stateAttrs = $derived(dataAttrs(comboboxState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
