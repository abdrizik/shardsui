import { AnimationFrame } from '$lib/internal/animation-frame.svelte'
import { createAnimationsFinished } from '$lib/internal/animations-finished.svelte'
import { getCssDimensions } from '$lib/internal/get-css-dimensions'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import { watch } from '$lib/internal/watch.svelte'
import { on } from 'svelte/events'

type Size = { width: number; height: number }

const DEFAULT_SIZE: Size = { width: 0, height: 0 }

function getPositionerFixedSize(positionerElement: HTMLElement): Size | null {
  const width = parseFloat(positionerElement.style.getPropertyValue('--positioner-width')) || 0
  const height = parseFloat(positionerElement.style.getPropertyValue('--positioner-height')) || 0

  if (width <= 0 || height <= 0) {
    return null
  }

  return { width, height }
}

type PopupSizingOptions = {
  popupElement: HTMLElement | null
  positionerElement: HTMLElement | null
  currentContentElement: HTMLElement | null
  value: unknown
  mounted: boolean
  transitionStatus: TransitionStatus
}

export function createPopupSizing(options: () => PopupSizingOptions) {
  const mutationFrame = new AnimationFrame()
  const resizeFrame = new AnimationFrame()
  const sizeFrame = new AnimationFrame()

  let autoSizeResetController: AbortController | null = null

  let prevSize: Size = { ...DEFAULT_SIZE }
  let skipAutoSizeSync = false

  const popupElement = $derived(options().popupElement)
  const positionerElement = $derived(options().positionerElement)
  const currentContentElement = $derived(options().currentContentElement)
  const value = $derived(options().value)
  const mounted = $derived(options().mounted)
  const transitionStatus = $derived(options().transitionStatus)
  const open = $derived(value != null)

  const animationsFinished = createAnimationsFinished(() => ({ element: popupElement }))

  function setAutoSizes(): void {
    const popup = popupElement
    if (!popup) return
    popup.style.setProperty('--popup-width', 'auto')
    popup.style.setProperty('--popup-height', 'auto')
  }

  function clearFixedSizes(): void {
    const popup = popupElement
    const positioner = positionerElement
    if (!popup || !positioner) return
    popup.style.removeProperty('--popup-width')
    popup.style.removeProperty('--popup-height')
    positioner.style.removeProperty('--positioner-width')
    positioner.style.removeProperty('--positioner-height')
  }

  function setFixedSizes(width: number, height: number): void {
    const popup = popupElement
    const positioner = positionerElement
    if (!popup || !positioner) return
    popup.style.setProperty('--popup-width', `${width}px`)
    popup.style.setProperty('--popup-height', `${height}px`)
    positioner.style.setProperty('--positioner-width', `${width}px`)
    positioner.style.setProperty('--positioner-height', `${height}px`)
  }

  function cancelAutoSizeReset(): void {
    autoSizeResetController?.abort()
    autoSizeResetController = null
  }

  function scheduleAutoSizeReset(): void {
    cancelAutoSizeReset()

    const ac = new AbortController()
    autoSizeResetController = ac

    animationsFinished.run(() => {
      autoSizeResetController = null
      setAutoSizes()
    }, ac.signal)
  }

  function syncCurrentSize(): void {
    const popup = popupElement
    const positioner = positionerElement
    if (!popup || !positioner) return

    sizeFrame.cancel()
    cancelAutoSizeReset()

    clearFixedSizes()

    const { width, height } = getCssDimensions(popup)
    if (width === 0 || height === 0) return

    prevSize = { width, height }
    setAutoSizes()
    positioner.style.setProperty('--positioner-width', `${width}px`)
    positioner.style.setProperty('--positioner-height', `${height}px`)
  }

  function getMutationBaseline(): { size: Size; interrupted: boolean } {
    const popup = popupElement
    if (!popup) return { size: prevSize, interrupted: false }

    const popupWidth = popup.style.getPropertyValue('--popup-width')
    const popupHeight = popup.style.getPropertyValue('--popup-height')
    const isResizing =
      popupWidth !== '' && popupWidth !== 'auto' && popupHeight !== '' && popupHeight !== 'auto'

    if (!isResizing) {
      return { size: prevSize, interrupted: false }
    }

    return {
      size: {
        width: popup.offsetWidth || prevSize.width,
        height: popup.offsetHeight || prevSize.height
      },
      interrupted: true
    }
  }

  function morphInterrupted({ width, height }: Size): void {
    const popup = popupElement
    const positioner = positionerElement
    if (!popup || !positioner) return

    sizeFrame.cancel()
    mutationFrame.cancel()
    cancelAutoSizeReset()

    if (width === 0 || height === 0) return

    setFixedSizes(width, height)

    mutationFrame.request(() => {
      mutationFrame.request(() => {
        clearFixedSizes()

        const measured = getCssDimensions(popup)
        const measuredWidth = measured.width || width
        const measuredHeight = measured.height || height

        setFixedSizes(width, height)

        sizeFrame.request(() => {
          if (value == null) return
          setFixedSizes(measuredWidth, measuredHeight)
          scheduleAutoSizeReset()
        })
      })
    })
  }

  function morphFrom({ width: previousWidth, height: previousHeight }: Size): void {
    const popup = popupElement
    const positioner = positionerElement
    if (!popup || !positioner) return

    cancelAutoSizeReset()

    clearFixedSizes()

    const { width, height } = getCssDimensions(popup)
    const measuredWidth = width || prevSize.width
    const measuredHeight = height || prevSize.height

    const collapsed = previousWidth === 0 || previousHeight === 0
    const startWidth = collapsed ? measuredWidth : previousWidth
    const startHeight = collapsed ? measuredHeight : previousHeight

    popup.style.setProperty('--popup-width', `${startWidth}px`)
    popup.style.setProperty('--popup-height', `${startHeight}px`)
    positioner.style.setProperty('--positioner-width', `${measuredWidth}px`)
    positioner.style.setProperty('--positioner-height', `${measuredHeight}px`)

    sizeFrame.request(() => {
      if (value == null) return

      popup.style.setProperty('--popup-width', `${measuredWidth}px`)
      popup.style.setProperty('--popup-height', `${measuredHeight}px`)

      scheduleAutoSizeReset()
    })
  }

  $effect(mutationFrame.disposeEffect)
  $effect(resizeFrame.disposeEffect)
  $effect(sizeFrame.disposeEffect)

  $effect(() => {
    const popup = popupElement
    if (!popup) return
    const ro = new ResizeObserver(() => {
      prevSize = { width: popup.offsetWidth, height: popup.offsetHeight }
    })
    ro.observe(popup)
    return () => ro.disconnect()
  })

  watch(
    () => value,
    (_, previous) => {
      if (previous == null) return
      mutationFrame.cancel()
      sizeFrame.cancel()
      cancelAutoSizeReset()
    }
  )

  $effect(() => {
    if (open) return
    mutationFrame.cancel()
    resizeFrame.cancel()
    sizeFrame.cancel()
    cancelAutoSizeReset()
    skipAutoSizeSync = false
  })

  $effect(() => {
    if (!mounted) {
      prevSize = { ...DEFAULT_SIZE }
    }
  })

  $effect(() => {
    if (!open) return
    const observed = currentContentElement
    const popup = popupElement
    if (!observed || !popup) return

    const mo = new MutationObserver(() => {
      if (transitionStatus === 'starting') {
        syncCurrentSize()
        return
      }

      const { size, interrupted } = getMutationBaseline()

      if (interrupted) {
        morphInterrupted(size)
        return
      }

      morphFrom(size)
    })

    mo.observe(observed, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['hidden']
    })

    return () => mo.disconnect()
  })

  $effect(() => {
    const popup = popupElement
    const positioner = positionerElement
    if (!open || !popup || !positioner) return
    const win = positioner.ownerDocument.defaultView ?? window
    const off = on(win, 'resize', () => resizeFrame.request(syncCurrentSize))
    return () => {
      resizeFrame.cancel()
      off()
    }
  })

  $effect(() => {
    void transitionStatus
    const popup = popupElement
    const content = currentContentElement
    if (!popup || !content || !open) return

    if (skipAutoSizeSync) {
      skipAutoSizeSync = false
      return
    }

    morphFrom(getCssDimensions(popup))
  })

  $effect(() => {
    const popup = popupElement
    const positioner = positionerElement
    if (open || !popup || !positioner) return
    const closeTransitionSize = getPositionerFixedSize(positioner)
    if (!closeTransitionSize) return
    setFixedSizes(closeTransitionSize.width, closeTransitionSize.height)
  })

  return {
    measureBeforeValueChange: (nextValue: unknown, allowSkipSync: boolean): Size | null => {
      const popup = popupElement
      const positioner = positionerElement
      if (!popup || !positioner) return null

      if (allowSkipSync && value != null && value !== nextValue) {
        skipAutoSizeSync = true
      }

      return getCssDimensions(popup)
    },

    morphFrom
  }
}
