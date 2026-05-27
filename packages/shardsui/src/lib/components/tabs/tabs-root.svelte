<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { TabsContext } from './context'
  import { TabsRoot, type TabsOrientation, type TabsState, type TabsValue } from './tabs.svelte'

  type Props = PartProps<[TabsState]> & {
    value?: TabsValue
    orientation?: TabsOrientation
    onValueChange?: (value: TabsValue) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value = $bindable(),
    orientation = 'horizontal',
    onValueChange,
    children,
    ...rest
  }: Props = $props()

  const tabs = new TabsRoot(() => ({
    value,
    setValue: (next) => (value = next),
    orientation,
    onValueChange
  }))

  TabsContext.set(tabs)
</script>

<svelte:element this={as} bind:this={ref} {...tabs.stateAttrs} {...rest}>
  {@render children?.(tabs.state)}
</svelte:element>
