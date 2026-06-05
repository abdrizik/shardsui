import type { DialogRoot } from '$lib/components/dialog/dialog.svelte'
import { dialogInteractions } from '$lib/components/dialog/interactions.svelte'
import { manageFocus, type FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
import { warn } from '$lib/internal/log'
import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
import { REASONS } from '$lib/internal/reasons'
import { untrack } from 'svelte'
import {
  DRAWER_SNAP_POINT_OFFSET_VAR,
  DRAWER_SWIPE_MOVEMENT_X_VAR,
  DRAWER_SWIPE_MOVEMENT_Y_VAR,
  DRAWER_SWIPE_PROGRESS_VAR,
  DRAWER_SWIPE_STRENGTH_VAR
} from './constants'
import type { DrawerRoot } from './drawer.svelte'
import { DrawerSnapPoints } from './snap-points.svelte'
import type { DrawerSwipe } from './swipe.svelte'

const SWIPE_PROPERTIES: PropertyDefinition[] = [
  { name: DRAWER_SWIPE_MOVEMENT_X_VAR, syntax: '<length>', inherits: false, initialValue: '0px' },
  { name: DRAWER_SWIPE_MOVEMENT_Y_VAR, syntax: '<length>', inherits: false, initialValue: '0px' },
  {
    name: DRAWER_SNAP_POINT_OFFSET_VAR,
    syntax: '<length>',
    inherits: false,
    initialValue: '0px'
  },
  { name: DRAWER_SWIPE_PROGRESS_VAR, syntax: '<number>', inherits: false, initialValue: '0' },
  { name: DRAWER_SWIPE_STRENGTH_VAR, syntax: '<number>', inherits: false, initialValue: '1' }
]

let swipePropertiesRegistered = false

function registerSwipeProperties() {
  if (swipePropertiesRegistered) return
  swipePropertiesRegistered = true
  if (typeof CSS === 'undefined') return

  for (const property of SWIPE_PROPERTIES) {
    try {
      CSS.registerProperty(property)
    } catch {}
  }
}

type DrawerPopupOptions = {
  ref: HTMLElement | null
  id: string
  initialFocus: FocusTarget | undefined
  finalFocus: FocusTarget | undefined
  keepMounted: boolean
}

/** Focus, dismissal, height measurement and drag styling for `DrawerPopup`. */
export class DrawerPopup {
  #dialog: DialogRoot
  #drawer: DrawerRoot
  #swipe: DrawerSwipe | undefined
  #options: () => DrawerPopupOptions

  #lastMeasuredHeight = 0

  #snapPoints: DrawerSnapPoints

  nestedDrawerOpen = $derived.by(() => this.#dialog.nestedOpenDrawerCount > 0)

  expanded = $derived.by(() => this.#drawer.activeSnapPoint === 1)

  swiping = $derived.by(() => this.#swipe?.swiping ?? false)

  releasing = $derived.by(() => this.#swipe?.releasing ?? false)

  shouldRender = $derived.by(() => this.#dialog.mounted || this.#options().keepMounted)

  nestedSwipeProgress = $derived.by(() =>
    this.#drawer.nestedSwipeProgress > 0 ? `${this.#drawer.nestedSwipeProgress}` : '0'
  )

  #applySnapPoints = $derived.by(() => {
    const snapPoints = this.#drawer.snapPoints
    const direction = this.#drawer.swipeDirection
    return !!snapPoints && snapPoints.length > 0 && (direction === 'up' || direction === 'down')
  })

  #activeSnapPointOffset = $derived.by(() => this.#snapPoints.activeSnapPointOffset)

  snapPointOffset = $derived.by(() => {
    const offset = this.#activeSnapPointOffset
    if (!this.#applySnapPoints || offset === null) return 0
    return this.#drawer.swipeDirection === 'up' ? -offset : offset
  })

  #dragStyles = $derived.by((): Record<string, string | undefined> => {
    const styles: Record<string, string | undefined> = this.#swipe?.dragStyles ?? {}
    if (!this.#applySnapPoints || this.#drawer.swipeDirection !== 'down') return styles

    const baseOffset = this.#activeSnapPointOffset ?? 0
    const movement = Number.parseFloat(styles[DRAWER_SWIPE_MOVEMENT_Y_VAR] ?? '')
    const nextOffset = baseOffset + (Number.isFinite(movement) ? movement : 0)
    if (!this.swiping || !(nextOffset < 0)) return { ...styles, transform: undefined }

    return {
      ...styles,
      transform: undefined,
      [DRAWER_SWIPE_MOVEMENT_Y_VAR]: `${-Math.sqrt(-nextOffset) - baseOffset}px`
    }
  })

  dragMovementX = $derived(this.#dragStyles[DRAWER_SWIPE_MOVEMENT_X_VAR] ?? '0px')
  dragMovementY = $derived(this.#dragStyles[DRAWER_SWIPE_MOVEMENT_Y_VAR] ?? '0px')
  dragTransform = $derived(this.#dragStyles.transform ?? null)
  dragTransition = $derived(this.#dragStyles.transition ?? null)

  popupHeightVar = $derived.by(() => {
    const shouldUseAutoHeight =
      !this.#drawer.hasNestedDrawer && this.#dialog.transitionStatus !== 'ending'
    return this.#drawer.popupHeight && !shouldUseAutoHeight ? `${this.#drawer.popupHeight}px` : null
  })

  frontmostHeightVar = $derived.by(() =>
    this.#drawer.frontmostHeight ? `${this.#drawer.frontmostHeight}px` : null
  )

  swipeStrengthVar = $derived.by(() => {
    const strength = this.#swipe?.swipeStrength ?? null
    return typeof strength === 'number' && Number.isFinite(strength) && strength > 0
      ? `${strength}`
      : '1'
  })

  constructor(
    dialog: DialogRoot,
    drawer: DrawerRoot,
    swipe: DrawerSwipe | undefined,
    options: () => DrawerPopupOptions
  ) {
    this.#dialog = dialog
    this.#drawer = drawer
    this.#swipe = swipe
    this.#options = options

    this.#snapPoints = new DrawerSnapPoints(() => ({
      viewportElement: dialog.viewportElement,
      snapPoints: drawer.snapPoints,
      activeSnapPoint: drawer.activeSnapPoint,
      popupHeight: drawer.popupHeight
    }))

    $effect(() => {
      if (!this.#swipe) {
        warn(
          '<Drawer.Popup> expected to be rendered within <Drawer.Viewport>. Omitting the',
          'viewport disables drawer swipe handling and touch scroll locking. Wrap',
          '<Drawer.Popup> in <Drawer.Viewport>.'
        )
      }
    })

    $effect.pre(() => {
      this.#dialog.popupId = this.#options().id
      return () => {
        this.#dialog.popupId = undefined
      }
    })

    $effect.pre(() => this.#measurePopupHeight())

    $effect(() => {
      const parent = this.#drawer.parent
      if (!parent) return
      const present = this.#dialog.open || this.#dialog.transitionStatus === 'ending'
      parent.hasNestedDrawer = present
      return () => (parent.hasNestedDrawer = false)
    })

    $effect(() => {
      const parent = this.#drawer.parent
      if (!parent || !this.#dialog.open) return
      parent.onNestedFrontmostHeightChange(this.#drawer.frontmostHeight)
      return () => parent.onNestedFrontmostHeightChange(0)
    })

    openChangeComplete(() => ({
      open: this.#dialog.open,
      element: this.#options().ref,
      onComplete: () => {
        if (this.#dialog.open) this.#dialog.onOpenChangeComplete?.(true)
      }
    }))

    dialogInteractions(() => ({
      dialog: this.#dialog,
      popupElement: this.#options().ref
    }))

    manageFocus(() => ({
      open: this.#dialog.open,
      modal: this.#dialog.modal !== false,
      enabled: this.#dialog.mounted,
      popupElement: this.#options().ref,
      triggerElement: this.#dialog.activeTrigger,
      openMethod: this.#dialog.openMethod,
      initialFocus: this.#options().initialFocus ?? this.#options().ref ?? true,
      finalFocus: this.#options().finalFocus,
      closeOnFocusOut: !this.#dialog.disablePointerDismissal,
      onFocusOut: (event) => {
        this.#dialog.setOpen(false, REASONS.focusOut, event)
      },
      restoreFocus: 'popup',
      closeEvent: this.#dialog.lastCloseEvent,
      closeReason: this.#dialog.openChangeReason
    }))
  }

  #measurePopupHeight(): (() => void) | undefined {
    const dialog = this.#dialog
    const drawer = this.#drawer

    if (!dialog.mounted) {
      this.#lastMeasuredHeight = 0
      drawer.onPopupHeightChange(0)
      return
    }

    const element = this.#options().ref
    if (!element) return

    // Read tracked so opening or closing a nested drawer re-runs the effect and re-measures,
    // which is what latches and unlatches the kept height below.
    void this.nestedDrawerOpen

    registerSwipeProperties()

    const measure = () => {
      const offsetHeight = element.offsetHeight
      const frontmost = untrack(() => drawer.frontmostHeight)
      const hasNested = untrack(() => drawer.hasNestedDrawer)

      if (
        this.#lastMeasuredHeight > 0 &&
        frontmost > this.#lastMeasuredHeight &&
        offsetHeight > this.#lastMeasuredHeight
      ) {
        return
      }

      if (this.#lastMeasuredHeight > 0 && hasNested) {
        drawer.onPopupHeightChange(this.#lastMeasuredHeight)
        return
      }

      if (offsetHeight === this.#lastMeasuredHeight) return

      this.#lastMeasuredHeight = offsetHeight
      drawer.onPopupHeightChange(offsetHeight)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }
}
