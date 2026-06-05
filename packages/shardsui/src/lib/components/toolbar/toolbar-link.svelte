<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { CompositeItem } from '$lib/internal/floating/composite.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { ToolbarContext, type ToolbarLinkState } from './context'

  type Props = PartProps<[ToolbarLinkState], 'a'>

  let { as = 'a', ref = $bindable(null), onfocus, children, ...rest }: Props = $props()

  const toolbar = ToolbarContext.get()

  const item = new CompositeItem(() => ({ composite: toolbar.composite, ref, disabled: false }))

  const toolbarState: ToolbarLinkState = $derived({ orientation: toolbar.orientation })

  const stateAttrs = $derived(dataAttrs(toolbarState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  tabindex={item.tabindex}
  onfocus={chain(onfocus, item.onfocus)}
  {...rest}
>
  {@render children?.(toolbarState)}
</svelte:element>
