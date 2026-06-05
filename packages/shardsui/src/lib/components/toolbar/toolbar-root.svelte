<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { Composite } from '$lib/internal/floating/composite.svelte'
  import type { Orientation, PartProps } from '$lib/internal/types'
  import { ToolbarContext, type ToolbarRootState } from './context'

  type Props = PartProps<[ToolbarRootState]> & {
    disabled?: boolean
    orientation?: Orientation
    loopFocus?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    disabled = false,
    orientation = 'horizontal',
    loopFocus = true,
    onkeydown,
    onfocusin,
    children,
    ...rest
  }: Props = $props()

  const composite = new Composite(() => ({ orientation, loopFocus, ref }))

  const toolbar = {
    composite,
    get disabled() {
      return disabled
    },
    get orientation() {
      return orientation
    }
  }

  ToolbarContext.set(toolbar)

  const toolbarState: ToolbarRootState = $derived({ disabled, orientation })

  const stateAttrs = $derived(dataAttrs(toolbarState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  role="toolbar"
  aria-orientation={orientation}
  onkeydown={chain(onkeydown, composite.onkeydown)}
  onfocusin={chain(onfocusin, composite.onfocus)}
  {...rest}
>
  {@render children?.(toolbarState)}
</svelte:element>
