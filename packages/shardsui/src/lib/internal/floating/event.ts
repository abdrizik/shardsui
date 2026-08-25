import { isAndroid } from '$lib/internal/detect-browser'

export function isVirtualClick(event: MouseEvent): boolean {
  const pointerType = 'pointerType' in event ? event.pointerType : undefined
  if (pointerType === '' && event.isTrusted) {
    return true
  }
  if (isAndroid && pointerType) {
    return event.type === 'click' && event.buttons === 1
  }
  return event.detail === 0 && !pointerType
}

export function isVirtualPointerEvent(event: PointerEvent): boolean {
  return (
    (!isAndroid && event.width === 0 && event.height === 0) ||
    (isAndroid &&
      event.width === 1 &&
      event.height === 1 &&
      event.pressure === 0 &&
      event.detail === 0 &&
      event.pointerType === 'mouse') ||
    // iOS VoiceOver returns 0.333… for width/height.
    (event.width < 1 &&
      event.height < 1 &&
      event.pressure === 0 &&
      event.detail === 0 &&
      event.pointerType === 'touch')
  )
}

export function isClickLikeEvent(type: string | undefined): boolean {
  return type === 'click' || type === 'mousedown' || type === 'keydown' || type === 'keyup'
}
