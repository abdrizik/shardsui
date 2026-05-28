import { untrack } from 'svelte'
import { AnimationFrame } from './animation-frame.svelte'
import { createAnimationsFinished } from './animations-finished.svelte'
import type { Side } from './floating/anchor-positioning.svelte'
import { getCssDimensions } from './get-css-dimensions'
import { setTemporaryStyle, setTemporaryStyles } from './temporary-style'

type Dimensions = { width: number; height: number }

const EMPTY_STYLES: Record<string, string> = {}

type PopupAutoResizeOptions = {
  popupElement: HTMLElement | null
  positionerElement: HTMLElement | null
  mounted: boolean
  content: unknown
  side: Side
  direction: 'ltr' | 'rtl'
  onMeasureLayout: () => void
  onMeasureLayoutComplete: (previousDimensions: Dimensions | null) => void
}

function setPopupCssSize(popupElement: HTMLElement, size: Dimensions | 'auto') {
  const width = size === 'auto' ? 'auto' : `${size.width}px`
  const height = size === 'auto' ? 'auto' : `${size.height}px`
  popupElement.style.setProperty('--popup-width', width)
  popupElement.style.setProperty('--popup-height', height)
}

function setPositionerCssSize(positionerElement: HTMLElement, size: Dimensions | 'max-content') {
  const width = size === 'max-content' ? 'max-content' : `${size.width}px`
  const height = size === 'max-content' ? 'max-content' : `${size.height}px`
  positionerElement.style.setProperty('--positioner-width', width)
  positionerElement.style.setProperty('--positioner-height', height)
}

function getAnchoringStyles(side: Side, direction: 'ltr' | 'rtl'): Record<string, string> {
  const isPhysicalTop = side === 'top'
  const isPhysicalLeft =
    side === 'left' || side === (direction === 'rtl' ? 'inline-end' : 'inline-start')

  if (!isPhysicalTop && !isPhysicalLeft) return EMPTY_STYLES

  return {
    position: 'absolute',
    [isPhysicalTop ? 'bottom' : 'top']: '0',
    [isPhysicalLeft ? 'right' : 'left']: '0'
  }
}

export function popupAutoResize(options: () => PopupAutoResizeOptions): void {
  const popupElement = $derived(options().popupElement)
  const positionerElement = $derived(options().positionerElement)
  const mounted = $derived(options().mounted)
  const content = $derived(options().content)
  const side = $derived(options().side)
  const direction = $derived(options().direction)
  const anchoringStyles = $derived(getAnchoringStyles(side, direction))

  const animationFrame = new AnimationFrame()
  const animationsFinished = createAnimationsFinished(() => ({
    element: popupElement,
    waitForStartingStyleRemoved: true
  }))

  let committedDimensions: Dimensions | null = null
  let isInitialRender = true

  $effect(animationFrame.disposeEffect)

  $effect(() => {
    const isMounted = mounted
    void content
    const popup = popupElement
    const positioner = positionerElement
    const styles = anchoringStyles

    return untrack(() => {
      if (!isMounted) {
        isInitialRender = true
        committedDimensions = null
        return
      }

      if (!popup || !positioner) return

      const restoreAnchoringStyles = setTemporaryStyles(popup, styles)

      setPopupCssSize(popup, 'auto')

      const restorePopupPosition = setTemporaryStyle(popup, 'position', 'static')
      const restorePopupTransform = setTemporaryStyle(popup, 'transform', 'none')
      const restorePopupScale = setTemporaryStyle(popup, 'scale', '1')
      const restorePositionerAvailableSize = setTemporaryStyles(positioner, {
        '--available-width': 'max-content',
        '--available-height': 'max-content'
      })

      function restoreMeasurementOverrides() {
        restorePopupPosition()
        restorePopupTransform()
        restorePopupScale()
        restorePositionerAvailableSize()
      }

      options().onMeasureLayout()

      if (isInitialRender || committedDimensions === null) {
        setPositionerCssSize(positioner, 'max-content')

        const dimensions = getCssDimensions(popup)

        committedDimensions = dimensions

        setPositionerCssSize(positioner, dimensions)
        restoreMeasurementOverrides()
        options().onMeasureLayoutComplete(null)

        isInitialRender = false

        return restoreAnchoringStyles
      }

      setPositionerCssSize(positioner, 'max-content')

      const previousDimensions = committedDimensions
      const newDimensions = getCssDimensions(popup)

      committedDimensions = newDimensions

      setPopupCssSize(popup, previousDimensions)
      restoreMeasurementOverrides()
      options().onMeasureLayoutComplete(previousDimensions)

      setPositionerCssSize(positioner, newDimensions)

      const abortController = new AbortController()

      animationFrame.request(() => {
        setPopupCssSize(popup, newDimensions)

        animationsFinished.run(() => {
          popup.style.setProperty('--popup-width', 'auto')
          popup.style.setProperty('--popup-height', 'auto')
        }, abortController.signal)
      })

      return () => {
        abortController.abort()
        animationFrame.cancel()
        restoreAnchoringStyles()
      }
    })
  })
}
