<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { CompositeItem } from '$lib/internal/floating/composite.svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { ToolbarGroupContext, ToolbarContext } from './context'

  type Props = Omit<HTMLInputAttributes, 'children' | 'disabled'> & {
    ref?: HTMLInputElement | null
    disabled?: boolean
  }

  let {
    ref = $bindable(null),
    disabled: disabledProp = false,
    onclick,
    onkeydown,
    onpointerdown,
    onfocus,
    ...rest
  }: Props = $props()

  const toolbar = ToolbarContext.get()
  const group = ToolbarGroupContext.getOr()

  const disabled = $derived(toolbar.disabled || group?.disabled || disabledProp)

  const item = new CompositeItem(() => ({
    composite: toolbar.composite,
    ref,
    disabled: false
  }))

  function preventWhenDisabled(event: Event) {
    if (disabled) event.preventDefault()
  }

  function preventKeysWhenDisabled(event: KeyboardEvent) {
    if (disabled && event.key !== 'Tab') {
      event.preventDefault()
    }
  }

  const stateAttrs = $derived(
    dataAttrs({
      disabled,
      orientation: toolbar.orientation
    })
  )
</script>

<input
  bind:this={ref}
  {...stateAttrs}
  tabindex={item.tabindex}
  aria-disabled={disabled || undefined}
  onfocus={chain(onfocus, item.onfocus)}
  onclick={chain(onclick, preventWhenDisabled)}
  onpointerdown={chain(onpointerdown, preventWhenDisabled)}
  onkeydown={chain(onkeydown, preventKeysWhenDisabled)}
  {...rest}
/>
