<script lang="ts">
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { CompositeItem } from '$lib/internal/floating/composite.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { ToolbarGroupContext, ToolbarContext, type ToolbarRootState } from './context'

  type Props = PartProps<[ToolbarRootState], 'button'> & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    disabled: disabledProp = false,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    onfocus,
    children,
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

  const btn = new Button(() => ({
    disabled,
    focusableWhenDisabled: true,
    composite: true,
    as,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const toolbarState: ToolbarRootState = $derived({
    disabled,
    orientation: toolbar.orientation
  })

  const stateAttrs = $derived(dataAttrs(toolbarState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  tabindex={item.tabindex}
  onfocus={chain(onfocus, item.onfocus)}
  {...rest}
>
  {@render children?.(toolbarState)}
</svelte:element>
