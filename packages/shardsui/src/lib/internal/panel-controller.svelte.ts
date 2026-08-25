import { on } from 'svelte/events'
import { cancelAnimationFrameTick, requestAnimationFrameTick } from './animation-frame.svelte'
import { createAnimationsFinished } from './animations-finished.svelte'
import { setTemporaryStyle, setTemporaryStyles } from './temporary-style'
import type { TransitionStatus } from './transition-status.svelte'

type AnimationType = 'css-transition' | 'css-animation' | 'none'

type Dimensions = {
  height: number | undefined
  width: number | undefined
}

const EMPTY_DIMENSIONS: Dimensions = {
  height: undefined,
  width: undefined
}

type PanelControllerOptions = {
  panel: HTMLElement | null
  open: boolean
  mounted: boolean
  transitionStatus: TransitionStatus
  keepMounted: boolean
  hiddenUntilFound: boolean
  setMounted: (next: boolean) => void
  setOpen: (open: boolean) => void
}

function getDimensions(element: HTMLElement): { height: number; width: number } {
  return {
    height: element.scrollHeight,
    width: element.scrollWidth
  }
}

function getAnimationType(
  element: HTMLElement,
  hasSuppressedMountAnimation: boolean
): AnimationType {
  const win = element.ownerDocument.defaultView ?? window
  const styles = win.getComputedStyle(element)
  const hasAnimation =
    (styles.animationName
      .split(',')
      .map((n) => n.trim())
      .some((n) => n !== '' && n !== 'none') ||
      hasSuppressedMountAnimation) &&
    hasNonZeroDuration(styles.animationDuration)
  const hasTransition = hasNonZeroDuration(styles.transitionDuration)

  if (hasTransition) return 'css-transition'
  if (hasAnimation) return 'css-animation'
  return 'none'
}

function hasNonZeroDuration(value: string): boolean {
  return value
    .split(',')
    .map((part) => part.trim())
    .some((part) => part !== '' && Number.parseFloat(part) > 0)
}

const INITIAL_LAYOUT_STYLES: Record<string, string> = {
  'justify-content': 'initial',
  'align-items': 'initial',
  'align-content': 'initial',
  'justify-items': 'initial'
}

function resetLayoutStyles(element: HTMLElement): () => void {
  const restore = setTemporaryStyles(element, INITIAL_LAYOUT_STYLES, 'important')
  const frame = requestAnimationFrameTick(restore)

  return () => {
    cancelAnimationFrameTick(frame)
    restore()
  }
}

export class PanelController {
  #dimensions = $state.raw<Dimensions>(EMPTY_DIMENSIONS)
  #animationType = $state<AnimationType>('none')
  #forcePanelIdle = $state(false)

  #lastMeasuredDimensions = $state.raw<Dimensions>(EMPTY_DIMENSIONS)
  #shouldPreventMountAnimation: boolean
  // `beforematch` must reveal the matched content immediately, so the next open skips
  // author-defined motion once.
  #shouldSkipNextOpen = false
  #pendingTemporaryStyleRestore: (() => void) | null = null

  #options: () => PanelControllerOptions

  #panel = $derived.by(() => this.#options().panel)
  #open = $derived.by(() => this.#options().open)
  #mounted = $derived.by(() => this.#options().mounted)
  #transitionStatus = $derived.by(() => this.#options().transitionStatus)
  #keepMounted = $derived.by(() => this.#options().keepMounted)
  #hiddenUntilFound = $derived.by(() => this.#options().hiddenUntilFound)
  #setMounted = $derived.by(() => this.#options().setMounted)

  constructor(options: () => PanelControllerOptions) {
    this.#options = options
    this.#shouldPreventMountAnimation = $state(this.#options().open)

    const openIdleAnimationsFinished = createAnimationsFinished(() => ({
      element: this.#panel,
      waitForStartingStyleRemoved: true
    }))

    const closeAnimationsFinished = createAnimationsFinished(() => ({
      element: this.#panel
    }))

    $effect.pre(() => {
      if (!this.#forcePanelIdle || this.#transitionStatus === 'starting') return
      this.#forcePanelIdle = false
    })

    $effect(() => {
      const panel = this.#panel
      const open = this.#open
      const mounted = this.#mounted
      const transitionStatus = this.#transitionStatus
      if (!panel) return

      if (!open && this.#pendingTemporaryStyleRestore) {
        this.#restorePendingTemporaryStyle()
      }

      const animType = getAnimationType(panel, this.shouldPreventOpenAnimation)
      this.#animationType = animType

      if (
        open &&
        transitionStatus === 'idle' &&
        this.#shouldPreventMountAnimation &&
        animType === 'css-animation'
      ) {
        this.#lastMeasuredDimensions = getDimensions(panel)
        return
      }

      if (open && transitionStatus === 'starting') {
        const skipNextOpen = this.#shouldSkipNextOpen
        this.#shouldSkipNextOpen = false

        if (animType === 'none') {
          this.#setDimensions(getDimensions(panel))
          this.#forcePanelIdle = true
          return
        }

        if (animType === 'css-transition') {
          const restoreLayoutStyles = resetLayoutStyles(panel)
          this.#setDimensions(getDimensions(panel))

          if (!skipNextOpen) {
            return restoreLayoutStyles
          }

          const restoreTransitionDuration = setTemporaryStyle(panel, 'transition-duration', '0s')
          this.#setPendingTemporaryStyleRestore(restoreTransitionDuration)
          this.#forcePanelIdle = true
          return restoreLayoutStyles
        }

        this.#setDimensions(getDimensions(panel))

        const restoreAnimationName = setTemporaryStyle(panel, 'animation-name', 'none')

        if (!skipNextOpen) {
          restoreAnimationName()
          return
        }

        const restoreAnimationDuration = setTemporaryStyle(panel, 'animation-duration', '0s')
        restoreAnimationName()
        this.#setPendingTemporaryStyleRestore(restoreAnimationDuration)
        this.#forcePanelIdle = true
        return
      }

      if (!open && mounted && (transitionStatus === 'idle' || transitionStatus === 'starting')) {
        this.#shouldPreventMountAnimation = false

        if (animType === 'none') {
          this.#setDimensions(EMPTY_DIMENSIONS, false)
          this.#setMounted(false)
          return
        }

        this.#setDimensions(getDimensions(panel))
        return
      }

      if (transitionStatus !== 'ending') return

      if (animType === 'none') {
        this.#setMounted(false)
        return
      }

      const next = getDimensions(panel)
      if (next.height === 0 && next.width === 0) {
        this.#setMounted(false)
        return
      }

      this.#setDimensions(next)
    })

    $effect(() => {
      const open = this.#open
      const mounted = this.#mounted
      const panel = this.#panel
      if (!open || !mounted || this.status !== 'idle' || !panel) return

      const abortController = new AbortController()
      openIdleAnimationsFinished.run(() => {
        if (abortController.signal.aborted) return
        if (!this.#open) return
        this.#setDimensions(EMPTY_DIMENSIONS, false)
      }, abortController.signal)

      return () => abortController.abort()
    })

    // Chrome can register the exit transition a frame after `[data-ending-style]` lands when an
    // Accordion closes one item while opening another, so wait one frame before watching.
    $effect(() => {
      const open = this.#open
      const mounted = this.#mounted
      const panel = this.#panel
      if (open || !mounted || this.status !== 'ending' || !panel) return

      const abortController = new AbortController()
      let endingStyleFrame = -1

      endingStyleFrame = requestAnimationFrameTick(() => {
        if (abortController.signal.aborted) return
        closeAnimationsFinished.run(() => {
          if (abortController.signal.aborted) return
          if (this.#open) return
          this.#setMounted(false)
          this.#setDimensions(EMPTY_DIMENSIONS, false)
        }, abortController.signal)
      })

      return () => {
        cancelAnimationFrameTick(endingStyleFrame)
        abortController.abort()
      }
    })

    $effect(() => {
      const panel = this.#panel
      if (!panel) return

      const onbeforematch = () => {
        this.#options().setOpen(true)

        if (this.#open) {
          this.#shouldSkipNextOpen = true
        }
      }

      return on(panel, 'beforematch', onbeforematch)
    })
  }

  #restorePendingTemporaryStyle(): void {
    const restore = this.#pendingTemporaryStyleRestore
    this.#pendingTemporaryStyleRestore = null
    restore?.()
  }

  #setPendingTemporaryStyleRestore(restore: () => void): void {
    this.#restorePendingTemporaryStyle()
    this.#pendingTemporaryStyleRestore = restore
  }

  #setDimensions(next: Dimensions, shouldCacheMeasurement = true): void {
    if (shouldCacheMeasurement) {
      this.#lastMeasuredDimensions = next
    }
    this.#dimensions = next
  }

  #hidden = $derived(!this.#open && !this.#mounted)

  hiddenAttr: true | 'until-found' | undefined = $derived(
    this.#hidden ? (this.#hiddenUntilFound ? 'until-found' : true) : undefined
  )

  status: TransitionStatus = $derived(this.#forcePanelIdle ? 'idle' : this.#transitionStatus)

  // `.by` defers the read: `#shouldPreventMountAnimation` has no field initializer, so the eager
  // `$derived(...)` form reads it before the constructor assigns it (TS2729).
  shouldPreventOpenAnimation = $derived.by(() => this.#open && this.#shouldPreventMountAnimation)

  shouldPersistHiddenTransitionStyles = $derived(
    this.#hiddenUntilFound && this.#hidden && this.#animationType !== 'css-animation'
  )

  #renderedDimensions: Dimensions = $derived(
    !this.#open &&
      this.#mounted &&
      this.#animationType === 'css-animation' &&
      this.#dimensions.height === undefined &&
      this.#dimensions.width === undefined
      ? this.#lastMeasuredDimensions
      : this.#dimensions
  )

  shouldRender = $derived(
    this.#keepMounted || this.#hiddenUntilFound || this.#mounted || this.#open
  )

  heightPx = $derived(
    this.#renderedDimensions.height === undefined ? 'auto' : `${this.#renderedDimensions.height}px`
  )

  widthPx = $derived(
    this.#renderedDimensions.width === undefined ? 'auto' : `${this.#renderedDimensions.width}px`
  )
}
