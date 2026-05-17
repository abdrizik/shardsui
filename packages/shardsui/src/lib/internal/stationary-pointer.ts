import { isWebKit } from '$lib/internal/detect-browser'

export function isStationaryWebKitPointer(event: MouseEvent): boolean {
  return isWebKit && event.movementX === 0 && event.movementY === 0
}
