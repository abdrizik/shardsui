<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { DrawerProviderContext, type DrawerIndentState } from './context'

  type Props = PartProps<[DrawerIndentState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const provider = DrawerProviderContext.getOr()

  const active = $derived(provider?.active ?? false)

  const drawerState: DrawerIndentState = $derived({ active })

  const stateAttrs = $derived(
    dataAttrs({
      active,
      inactive: !active
    })
  )
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} {...rest}>
  {@render children?.(drawerState)}
</svelte:element>
