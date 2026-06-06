import { cancelAnimationFrameTick, requestAnimationFrameTick } from '../animation-frame.svelte'
import { scrollLock } from '../scroll-lock.svelte'

const VIEWPORT_WIDTH_TOLERANCE_PX = 20

type AnchoredPopupScrollLockOptions = {
  enabled: boolean
  touchOpen: boolean
  positionerElement: HTMLElement | null
  referenceElement: Element | null
}

export function anchoredPopupScrollLock(options: () => AnchoredPopupScrollLockOptions): void {
  const enabled = $derived(options().enabled)
  const touchOpen = $derived(options().touchOpen)
  const positionerElement = $derived(options().positionerElement)
  const referenceElement = $derived(options().referenceElement)

  let touchOpenShouldLockScroll = $state(false)

  $effect(() => {
    const el = positionerElement
    if (!enabled || !touchOpen || el == null) {
      touchOpenShouldLockScroll = false
      return
    }

    const frameId = requestAnimationFrameTick(() => {
      const viewportWidth = el.ownerDocument.documentElement.clientWidth
      const popupWidth = el.offsetWidth
      touchOpenShouldLockScroll =
        viewportWidth > 0 &&
        popupWidth > 0 &&
        popupWidth >= viewportWidth - VIEWPORT_WIDTH_TOLERANCE_PX
    })
    return () => cancelAnimationFrameTick(frameId)
  })

  scrollLock(() => ({
    enabled: enabled && (!touchOpen || touchOpenShouldLockScroll),
    referenceElement
  }))
}
