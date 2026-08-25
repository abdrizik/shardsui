<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { Composite } from '$lib/internal/floating/composite.svelte'
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { hoverFloatingInteraction } from '$lib/internal/floating/hover/floating.svelte'
  import { getTarget, contains } from '$lib/internal/dom'
  import { REASONS } from '$lib/internal/reasons'
  import type { PartProps } from '$lib/internal/types'
  import {
    NavigationMenuContext,
    NavigationMenuCompositeContext,
    type NavigationMenuListState
  } from './context'

  type Props = PartProps<[NavigationMenuListState], 'ul'>

  let { as = 'ul', ref = $bindable(null), onkeydown, children, ...rest }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()

  hoverFloatingInteraction(navigationMenu, () => ({
    enabled: navigationMenu.hoverInteractionsEnabled,
    closeDelay: navigationMenu.closeDelay,
    tree: navigationMenu.floatingTree,
    nodeId: navigationMenu.floatingNodeId,
    parentId: navigationMenu.floatingParentNodeId
  }))

  const composite = navigationMenu.nested
    ? undefined
    : new Composite(() => ({
        orientation: navigationMenu.orientation,
        loopFocus: false,
        ref
      }))

  if (composite) {
    NavigationMenuCompositeContext.set(composite)
  }

  dismiss(() => ({
    open: navigationMenu.open,
    enabled: navigationMenu.interactionsEnabled,
    tree: navigationMenu.floatingTree,
    nodeId: navigationMenu.floatingNodeId,
    outsidePressEvent: 'intentional',
    outsidePress: (event) => !navigationMenu.containsTrigger(getTarget(event)),
    popupElement: navigationMenu.floatingElement,
    isInsideElement: (target) =>
      contains(navigationMenu.popupElement, target) || navigationMenu.containsTrigger(target),
    onClose: (reason, event) => {
      const closeReason = reason === REASONS.escapeKey ? REASONS.escapeKey : REASONS.outsidePress
      navigationMenu.setValue(null, closeReason, event)
    }
  }))

  function navigateList(event: KeyboardEvent) {
    if (navigationMenu.nested) {
      return
    }
    composite?.onkeydown(event)
    const shouldStop =
      (navigationMenu.orientation === 'horizontal' &&
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) ||
      (navigationMenu.orientation === 'vertical' &&
        (event.key === 'ArrowUp' || event.key === 'ArrowDown'))
    if (shouldStop) {
      event.stopPropagation()
    }
  }

  const navigationMenuState: NavigationMenuListState = $derived({ open: navigationMenu.open })

  const stateAttrs = $derived(dataAttrs({ open: navigationMenu.open }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  onkeydown={chain(onkeydown, navigateList)}
  {...rest}
>
  {@render children?.(navigationMenuState)}
</svelte:element>
