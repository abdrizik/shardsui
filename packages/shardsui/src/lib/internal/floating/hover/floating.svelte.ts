import { REASONS } from '$lib/internal/reasons'
import { isElement } from '@floating-ui/utils/dom'
import { on } from 'svelte/events'
import { contains, getTarget } from '../../dom'
import { Timeout } from '../../timeout'
import {
  FloatingNodeContext,
  FloatingTreeContext,
  getNodeChildren,
  type FloatingTree
} from '../floating-tree.svelte'
import type { HoverContext } from '../types'
import {
  applySafePolygonPointerEventsMutation,
  clearSafePolygonPointerEventsMutation,
  getHoverInteraction,
  type HoverInteraction
} from './interaction.svelte'
import {
  isClickLikeOpenEvent,
  isHoverOpenEvent,
  isInsideEnabledTrigger,
  isInteractiveElement
} from './predicates'

type HoverFloatingInteractionOptions = {
  enabled?: boolean
  closeDelay?: number
  nodeId?: string | undefined
  tree?: FloatingTree | null | undefined
  parentId?: string | null
}

export function hoverFloatingInteraction(
  root: HoverContext,
  options: () => HoverFloatingInteractionOptions
): void {
  const childClosedTimeout = new Timeout()

  const floatingTree = FloatingTreeContext.getOr() ?? null
  const floatingNode = FloatingNodeContext.getOr()

  const enabled = $derived(options().enabled ?? true)
  const closeDelay = $derived(options().closeDelay ?? 0)
  const nodeId = $derived(options().nodeId)
  const tree = $derived(options().tree ?? floatingTree)
  const parentId = $derived(options().parentId ?? floatingNode?.id ?? null)

  const instance: HoverInteraction = getHoverInteraction(root.data)

  function isHoverOpen(): boolean {
    return isHoverOpenEvent(root.data.openEvent?.type)
  }

  $effect(childClosedTimeout.disposeEffect)

  $effect(() => {
    if (!root.open) {
      instance.pointerType = undefined
      instance.restTimeoutPending = false
      instance.interactedInside = false
      clearSafePolygonPointerEventsMutation(instance)
    }
  })

  $effect(() => () => clearSafePolygonPointerEventsMutation(instance))

  $effect(() => {
    if (!enabled) return

    const open = root.open
    const floatingForScope = root.floatingElement
    const domReference = root.domReferenceElement

    if (
      open &&
      instance.closeGuardOptions?.().blockPointerEvents &&
      isHoverOpen() &&
      isElement(domReference) &&
      floatingForScope
    ) {
      const referenceElement = domReference as HTMLElement | SVGSVGElement

      const parentFloating = tree?.nodes.find((node) => node.id === parentId)?.floating ?? null

      if (parentFloating) {
        parentFloating.style.pointerEvents = ''
      }

      const cachedScopeElement =
        instance.pointerEventsScopeElement !== floatingForScope
          ? instance.pointerEventsScopeElement
          : null
      const parentScopeElement = parentFloating !== floatingForScope ? parentFloating : null
      const scopeElement =
        instance.closeGuardOptions?.().getScope?.() ??
        cachedScopeElement ??
        parentScopeElement ??
        referenceElement.closest('[data-rootownerid]') ??
        floatingForScope.ownerDocument.body
      applySafePolygonPointerEventsMutation(instance, {
        scopeElement,
        referenceElement,
        floatingElement: floatingForScope
      })
      return () => clearSafePolygonPointerEventsMutation(instance)
    }
  })

  $effect(() => {
    if (!enabled) return

    const floating = root.floatingElement
    if (!floating) return

    const hasParentChildren = (): boolean =>
      !!(tree && parentId && getNodeChildren(tree.nodes, parentId).length > 0)

    const onpointerdown = (event: PointerEvent): void => {
      const target = getTarget(event) as Element | null
      if (!isInteractiveElement(target)) {
        instance.interactedInside = false
        return
      }
      instance.interactedInside = target?.closest('[aria-haspopup]') != null
    }

    const onmouseenter = (): void => {
      instance.openChangeTimeout.clear()
      childClosedTimeout.clear()
      tree?.events.off('floating.closed', onNodeClosed)
      clearSafePolygonPointerEventsMutation(instance)
    }

    const onmouseleave = (event: MouseEvent): void => {
      if (hasParentChildren() && tree) {
        tree.events.on('floating.closed', onNodeClosed)
        return
      }

      if (isInsideEnabledTrigger(event.relatedTarget, root.triggerElements)) {
        return
      }

      const currentNodeId = root.data.closeGuardContext?.nodeId ?? nodeId
      const relatedTarget = event.relatedTarget
      const isMovingIntoDescendantFloating =
        !!tree &&
        !!currentNodeId &&
        isElement(relatedTarget) &&
        getNodeChildren(tree.nodes, currentNodeId, false).some((node) =>
          contains(node.floating, relatedTarget)
        )

      if (isMovingIntoDescendantFloating) {
        return
      }

      const mouseMoveHandler = instance.mouseMoveHandler
      if (mouseMoveHandler) {
        mouseMoveHandler(event)
        return
      }

      clearSafePolygonPointerEventsMutation(instance)
      if (
        isHoverOpen() &&
        !isClickLikeOpenEvent(root.data.openEvent?.type, instance.interactedInside)
      ) {
        instance.closeAfterDelay(root, tree, closeDelay, event)
      }
    }

    const onNodeClosed = (event: MouseEvent): void => {
      if (!tree || !parentId || hasParentChildren()) {
        return
      }
      childClosedTimeout.start(0, () => {
        tree.events.off('floating.closed', onNodeClosed)
        root.setOpen(false, REASONS.triggerHover, event)
        tree.events.emit('floating.closed', event)
      })
    }

    const offMouseEnter = on(floating, 'mouseenter', onmouseenter)
    const offMouseLeave = on(floating, 'mouseleave', onmouseleave)
    const offPointerDown = on(floating, 'pointerdown', onpointerdown, { capture: true })

    return () => {
      offMouseEnter()
      offMouseLeave()
      offPointerDown()
      tree?.events.off('floating.closed', onNodeClosed)
    }
  })
}
