<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import type { PartProps } from '$lib/internal/types'
  import { TabsContext, TabsListContext } from './context'
  import { TabsList } from './list.svelte'
  import type { TabsState } from './tabs.svelte'

  type Props = PartProps<[TabsState]> & {
    activateOnFocus?: boolean
    loopFocus?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    activateOnFocus = false,
    loopFocus = true,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  const tabs = TabsContext.get()

  const list = new TabsList(() => ({
    orientation: tabs.orientation,
    activateOnFocus,
    loopFocus,
    ref
  }))

  TabsListContext.set(list)
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...tabs.stateAttrs}
  {@attach list.observeList}
  role="tablist"
  aria-orientation={tabs.orientation === 'vertical' ? 'vertical' : undefined}
  onkeydown={chain(onkeydown, list.composite.onkeydown)}
  {...rest}
>
  {@render children?.(tabs.state)}
</svelte:element>
