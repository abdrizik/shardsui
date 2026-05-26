<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { PanelController } from '$lib/internal/panel-controller.svelte'
  import type { PartProps } from '$lib/internal/types'
  import type { CollapsibleState } from './collapsible.svelte'
  import { CollapsibleContext } from './context'

  type Props = PartProps<[CollapsibleState]> & {
    hiddenUntilFound?: boolean
    keepMounted?: boolean
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    hiddenUntilFound = false,
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const collapsible = CollapsibleContext.get()

  function registerPanelId() {
    collapsible.panelId = id
    return () => {
      collapsible.panelId = undefined
    }
  }

  const panel = new PanelController(() => ({
    panel: ref,
    open: collapsible.open,
    mounted: collapsible.mounted,
    transitionStatus: collapsible.transitionStatus,
    keepMounted,
    hiddenUntilFound,
    setMounted: collapsible.setMounted,
    setOpen: collapsible.setOpen
  }))

  const collapsibleState: CollapsibleState = $derived({
    ...collapsible.state,
    transitionStatus: panel.status
  })

  const stateAttrs = $derived(
    dataAttrs({
      'starting-style': panel.status === 'starting' || panel.shouldPersistHiddenTransitionStyles,
      'ending-style': panel.status === 'ending'
    })
  )
</script>

{#if panel.shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...collapsible.stateAttrs}
    {...stateAttrs}
    {@attach registerPanelId}
    {id}
    hidden={panel.hiddenAttr}
    style:--collapsible-panel-height={panel.heightPx}
    style:--collapsible-panel-width={panel.widthPx}
    style:animation-name={panel.shouldPreventOpenAnimation ? 'none' : undefined}
    {...rest}
  >
    {@render children?.(collapsibleState)}
  </svelte:element>
{/if}
