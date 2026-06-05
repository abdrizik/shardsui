<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { ToolbarContext, ToolbarGroupContext, type ToolbarRootState } from './context'

  type Props = PartProps<[ToolbarRootState]> & {
    disabled?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    disabled: disabledProp = false,
    children,
    ...rest
  }: Props = $props()

  const toolbar = ToolbarContext.get()

  const disabled = $derived(toolbar.disabled || disabledProp)

  ToolbarGroupContext.set({
    get disabled() {
      return disabled
    }
  })

  const toolbarState: ToolbarRootState = $derived({ disabled, orientation: toolbar.orientation })

  const stateAttrs = $derived(dataAttrs(toolbarState))
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} role="group" {...rest}>
  {@render children?.(toolbarState)}
</svelte:element>
