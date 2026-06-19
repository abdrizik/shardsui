import { createAnimationsFinished } from '$lib/internal/animations-finished.svelte'
import { DROPDOWN_COLLISION_AVOIDANCE, POPUP_COLLISION_AVOIDANCE } from '$lib/internal/constants'
import {
  AnchorPositioning,
  type Align,
  type AnchorPositioningProps,
  type CollisionAvoidance,
  type Side
} from '$lib/internal/floating/anchor-positioning.svelte'
import { anchoredPopupScrollLock } from '$lib/internal/floating/anchored-popup-scroll-lock.svelte'
import { positionerStyle } from '$lib/internal/floating/positioner-style'
import { REASONS } from '$lib/internal/reasons'
import { Timeout } from '$lib/internal/timeout'
import { untrack } from 'svelte'
import type { Attachment } from 'svelte/attachments'
import type { MenuItemHoverEvent, MenuOpenChangeEvent } from './context'
import type { MenuRoot } from './menu.svelte'

type MenuPositionerOptions = AnchorPositioningProps & {
  ref: HTMLElement | null
}

export class MenuPositioner {
  #menu: MenuRoot
  #options: () => MenuPositionerOptions

  #prevAnchor: Element | { getBoundingClientRect(): DOMRect } | null = null
  #closeTimeout = new Timeout()

  positioning: AnchorPositioning
  styleAttach: Attachment<HTMLElement>

  #isContextMenu = $derived.by(() => this.#menu.parentType === 'context-menu')
  #menubarModal = $derived.by(() => !!this.#menu.menubar?.modal)
  #popupModal = $derived.by(
    () => this.#menu.modal && this.#menu.openChangeReason !== REASONS.triggerHover
  )

  #side = $derived.by<Side>(() => {
    const menu = this.#menu
    const sideProp = this.#options().side
    if (sideProp != null) return sideProp
    if (menu.parentType === 'menu') return 'inline-end'
    if (menu.parentType === 'menubar' && menu.menubar?.orientation === 'vertical')
      return 'inline-end'
    return 'bottom'
  })

  #align = $derived.by<Align | undefined>(
    () => this.#options().align ?? (this.#menu.parentType !== undefined ? 'start' : undefined)
  )

  #collisionAvoidance = $derived.by<CollisionAvoidance>(
    () =>
      this.#options().collisionAvoidance ??
      (this.#menu.parentType === 'menu' ? POPUP_COLLISION_AVOIDANCE : DROPDOWN_COLLISION_AVOIDANCE)
  )

  #anchorElement = $derived.by(
    () => this.#options().anchor ?? this.#menu.contextMenu?.anchor ?? this.#menu.triggerElement
  )

  #isCursorAnchored = $derived.by(
    () => this.#isContextMenu && this.#options().side == null && this.#align !== 'center'
  )

  shouldRenderBackdrop = $derived.by(
    () => this.#menu.mounted && (this.#popupModal || this.#menubarModal)
  )

  backdropCutout = $derived.by(() => {
    const menu = this.#menu
    if (menu.parentType === 'menubar') return menu.menubar?.ref ?? null
    if (menu.parentType === undefined) return menu.triggerElement
    return null
  })

  constructor(menu: MenuRoot, options: () => MenuPositionerOptions) {
    this.#menu = menu
    this.#options = options

    $effect(this.#closeTimeout.disposeEffect)

    anchoredPopupScrollLock(() => ({
      enabled: menu.open && (this.#menubarModal || this.#popupModal),
      touchOpen: menu.openMethod === 'touch',
      positionerElement: this.#options().ref,
      referenceElement: menu.triggerElement
    }))

    this.positioning = new AnchorPositioning(() => {
      const opts = this.#options()
      return {
        anchor: menu.mounted ? this.#anchorElement : null,
        floating: menu.mounted ? opts.ref : null,
        side: this.#side,
        align: this.#align,
        sideOffset: opts.sideOffset ?? (this.#isCursorAnchored ? -5 : 0),
        alignOffset: opts.alignOffset ?? (this.#isCursorAnchored ? 2 : 0),
        positionMethod: menu.insideContextMenu ? 'fixed' : (opts.positionMethod ?? 'absolute'),
        collisionBoundary: opts.collisionBoundary,
        collisionPadding: opts.collisionPadding,
        collisionAvoidance: this.#collisionAvoidance,
        sticky: opts.sticky,
        arrowPadding: this.#isContextMenu ? 0 : opts.arrowPadding,
        shift: this.#isContextMenu
          ? {
              crossAxis: this.#collisionAvoidance.side !== 'flip',
              rootBoundary: 'layoutViewport'
            }
          : undefined,
        disableAnchorTracking: opts.disableAnchorTracking,
        adaptiveOrigin: menu.hasViewport
      }
    })

    this.styleAttach = positionerStyle(() => this.positioning.positionerStyles)

    const animationsFinished = createAnimationsFinished(() => ({
      element: this.#options().ref
    }))

    $effect.pre(() => {
      const currentAnchor = this.#anchorElement
      const prev = this.#prevAnchor
      if (currentAnchor) this.#prevAnchor = currentAnchor

      if (!currentAnchor || !prev || currentAnchor === prev) return

      menu.instantType = undefined
      const ac = new AbortController()
      animationsFinished.run(() => {
        menu.instantType = 'trigger-change'
      }, ac.signal)
      return () => ac.abort()
    })

    $effect(() => {
      const nodeId = menu.nodeId
      const parentNodeId = menu.parentNodeId

      function onMenuOpenChange(event: MenuOpenChangeEvent) {
        if (event.open) {
          if (event.parentNodeId === nodeId) {
            menu.hoverEnabled = false
          }
          if (event.nodeId !== nodeId && event.parentNodeId === parentNodeId) {
            menu.setOpen(false, REASONS.siblingOpen)
          }
        } else {
          if (event.nodeId === parentNodeId) {
            menu.setOpen(false, event.reason ?? REASONS.siblingOpen)
          }
        }
      }

      return menu.tree.events.on('menuopenchange', onMenuOpenChange)
    })

    $effect(() => {
      if (!menu.open && !menu.mounted) return

      menu.tree.events.emit('menuopenchange', {
        open: menu.open,
        nodeId: menu.nodeId,
        parentNodeId: menu.parentNodeId,
        // Read untracked: a reason change alone must not re-emit, only an `open` change may.
        reason: untrack(() => menu.openChangeReason)
      } satisfies MenuOpenChangeEvent)
    })

    $effect(() => {
      if (!menu.open) {
        this.#closeTimeout.clear()
      }
    })

    $effect(() => {
      const onItemHover = (event: MenuItemHoverEvent) => {
        if (!menu.open || event.nodeId !== menu.parentNodeId) return

        if (menu.triggerElement && menu.triggerElement !== event.target) {
          const delay = menu.hoverCloseDelay
          if (delay > 0) {
            if (!this.#closeTimeout.isStarted()) {
              this.#closeTimeout.start(delay, () => {
                menu.setOpen(false, REASONS.siblingOpen)
              })
            }
          } else {
            menu.setOpen(false, REASONS.siblingOpen)
          }
        } else {
          this.#closeTimeout.clear()
        }
      }

      return menu.tree.events.on('itemhover', onItemHover)
    })
  }
}
