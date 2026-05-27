<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { Transition } from '$lib/internal/transition-status.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { TabsContext, type TabsPanelState } from './context'
  import type { TabsValue } from './tabs.svelte'

  type Props = PartProps<[TabsPanelState]> & {
    value: TabsValue
    keepMounted?: boolean
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    value,
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const tabs = TabsContext.get()

  const open = $derived(value === tabs.value)

  const transition = new Transition(() => ({ open }))

  $effect.pre(() => {
    if (!transition.mounted && !keepMounted) return
    return tabs.registerPanel(value, id)
  })

  openChangeComplete(() => ({
    open,
    element: ref,
    onComplete: () => {
      if (!open) transition.mounted = false
    }
  }))

  const tabsState: TabsPanelState = $derived({
    ...tabs.state,
    hidden: !transition.mounted,
    transitionStatus: transition.status
  })

  const stateAttrs = $derived(
    dataAttrs({
      hidden: !transition.mounted,
      'starting-style': transition.status === 'starting',
      'ending-style': transition.status === 'ending'
    })
  )
</script>

{#if keepMounted || transition.mounted}
  <svelte:element
    this={as}
    bind:this={ref}
    {...tabs.stateAttrs}
    {...stateAttrs}
    {id}
    role="tabpanel"
    aria-labelledby={tabs.getTabIdByValue(value)}
    hidden={!transition.mounted}
    inert={!open}
    tabindex={open ? 0 : -1}
    {...rest}
  >
    {@render children?.(tabsState)}
  </svelte:element>
{/if}
