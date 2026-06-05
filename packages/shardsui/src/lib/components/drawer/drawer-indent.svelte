<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { DrawerProviderContext, type DrawerIndentState } from './context'

  type Props = PartProps<[DrawerIndentState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const provider = DrawerProviderContext.getOr()

  const active = $derived(provider?.active ?? false)
  const swipeProgress = $derived(provider?.visualState.swipeProgress ?? 0)
  const frontmostHeight = $derived(provider?.visualState.frontmostHeight ?? 0)

  const drawerState: DrawerIndentState = $derived({ active })

  const stateAttrs = $derived(
    dataAttrs({
      active,
      inactive: !active
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  style:--drawer-swipe-progress={swipeProgress > 0 ? swipeProgress : 0}
  style:--drawer-height={frontmostHeight > 0 ? `${frontmostHeight}px` : null}
  {style}
  {...rest}
>
  {@render children?.(drawerState)}
</svelte:element>
