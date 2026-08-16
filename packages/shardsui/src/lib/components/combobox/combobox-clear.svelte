<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { Transition } from '$lib/internal/transition-status.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { REASONS } from '$lib/internal/reasons'
  import { ComboboxContext, type ComboboxClearState } from './context'

  type Props = PartProps<
    [ComboboxClearState],
    'button',
    'onclick' | 'onkeydown' | 'onkeyup' | 'onmousedown'
  > & {
    disabled?: boolean
    keepMounted?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    disabled = false,
    keepMounted = false,
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

  const visible = $derived(
    combobox.noSelection ? combobox.inputValue !== '' : combobox.hasSelectedValue
  )

  const transition = new Transition(() => ({ open: visible }))

  openChangeComplete(() => ({
    open: visible,
    element: combobox.clearElement,
    onComplete: () => {
      if (!visible) transition.mounted = false
    }
  }))

  const isDisabled = $derived(disabled || combobox.disabled)
  const shouldRender = $derived(keepMounted || transition.mounted)

  const comboboxState: ComboboxClearState = $derived({
    disabled: isDisabled,
    visible,
    open: combobox.open,
    transitionStatus: transition.status
  })

  function clearValue() {
    if (combobox.readOnly) return
    combobox.setInputValue('', REASONS.clearPress)
    if (!combobox.noSelection) combobox.setValue(combobox.multiple ? [] : null)
    registry.setHighlightedIndex(-1)
    combobox.inputElement?.focus()
  }

  function preventFocusLoss(event: MouseEvent) {
    event.preventDefault()
  }

  const btn = new Button(() => ({
    disabled: isDisabled,
    as,
    tabindex: -1,
    onclick: chain(onclick, clearValue),
    onmousedown: chain(onmousedown, preventFocusLoss),
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(
    dataAttrs({
      'popup-open': combobox.open,
      disabled: isDisabled,
      visible,
      'starting-style': transition.status === 'starting',
      'ending-style': transition.status === 'ending'
    })
  )
</script>

{#if shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...btn.attrs}
    {...stateAttrs}
    {@attach attachElement((el) => (combobox.clearElement = el))}
    {@attach btn.attach}
    {...rest}
  >
    {#if children}
      {@render children(comboboxState)}
    {:else}
      x
    {/if}
  </svelte:element>
{/if}
