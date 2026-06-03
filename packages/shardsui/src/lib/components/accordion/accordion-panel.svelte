<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { PanelController } from '$lib/internal/panel-controller.svelte'
  import type { PartProps } from '$lib/internal/types'
  import type { AccordionPanelState } from './accordion.svelte'
  import { AccordionItemContext, AccordionContext } from './context'

  type Props = PartProps<[AccordionPanelState]> & {
    hiddenUntilFound?: boolean
    keepMounted?: boolean
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    children,
    ...rest
  }: Props = $props()

  const accordion = AccordionContext.get()
  const item = AccordionItemContext.get()
  const collapsible = item.collapsible

  function registerPanelId() {
    collapsible.panelId = id
    return () => {
      collapsible.panelId = undefined
    }
  }

  const panel = new PanelController(() => ({
    panel: ref,
    open: item.open,
    mounted: collapsible.mounted,
    transitionStatus: collapsible.transitionStatus,
    keepMounted: keepMountedProp ?? accordion.keepMounted,
    hiddenUntilFound: hiddenUntilFoundProp ?? accordion.hiddenUntilFound,
    setMounted: collapsible.setMounted,
    setOpen: collapsible.setOpen
  }))

  const accordionState: AccordionPanelState = $derived({
    ...item.state,
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
    {...item.stateAttrs}
    {...stateAttrs}
    {@attach registerPanelId}
    {id}
    hidden={panel.hiddenAttr}
    style:--accordion-panel-height={panel.heightPx}
    style:--accordion-panel-width={panel.widthPx}
    style:animation-name={panel.shouldPreventOpenAnimation ? 'none' : undefined}
    role="region"
    aria-labelledby={item.triggerId}
    {...rest}
  >
    {@render children?.(accordionState)}
  </svelte:element>
{/if}
