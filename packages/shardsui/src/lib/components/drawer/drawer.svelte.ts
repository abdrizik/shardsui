import type { SwipeDirection } from '$lib/internal/swipe-dismiss.svelte'

export type DrawerSwipeDirection = SwipeDirection
export type DrawerSnapPoint = number | string

type DrawerRootOptions = {
  parent: DrawerRoot | undefined
  swipeDirection: DrawerSwipeDirection
  snapPoints: DrawerSnapPoint[] | undefined
  snapPoint: DrawerSnapPoint | null
  snapToSequentialPoints: boolean
  setSnapPoint: (snapPoint: DrawerSnapPoint | null) => void
}

export class DrawerRoot {
  #options: () => DrawerRootOptions

  popupHeight = $state(0)
  frontmostHeight = $state(0)
  hasNestedDrawer = $state(false)
  nestedSwiping = $state(false)
  nestedSwipeProgress = $state(0)

  swipeAreaActive = $state(false)
  swipeDismissed = $state(false)

  #isNestedDrawerOpen = false

  parent = $derived.by(() => this.#options().parent)
  swipeDirection = $derived.by(() => this.#options().swipeDirection)
  snapPoints = $derived.by(() => this.#options().snapPoints)
  snapToSequentialPoints = $derived.by(() => this.#options().snapToSequentialPoints)

  activeSnapPoint = $derived.by(() => this.#options().snapPoint)

  constructor(options: () => DrawerRootOptions) {
    this.#options = options
  }

  setActiveSnapPoint = (next: DrawerSnapPoint | null) => {
    this.#options().setSnapPoint(next)
  }

  onPopupHeightChange = (height: number) => {
    this.popupHeight = height
    if (!this.#isNestedDrawerOpen && height > 0) {
      this.frontmostHeight = height
    }
  }

  onNestedFrontmostHeightChange = (height: number) => {
    if (height > 0) {
      this.#isNestedDrawerOpen = true
      this.frontmostHeight = height
      return
    }
    this.#isNestedDrawerOpen = false
    if (this.popupHeight > 0) {
      this.frontmostHeight = this.popupHeight
    }
  }

  onNestedSwipingChange = (swiping: boolean) => {
    this.nestedSwiping = swiping
    this.parent?.onNestedSwipingChange(swiping)
  }

  onNestedSwipeProgressChange = (progress: number) => {
    this.nestedSwipeProgress = Number.isFinite(progress) ? progress : 0
    this.parent?.onNestedSwipeProgressChange(progress)
  }
}
