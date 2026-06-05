import { clamp } from '$lib/internal/clamp'
import type { DrawerSnapPoint } from './drawer.svelte'

type ResolvedDrawerSnapPoint = {
  value: DrawerSnapPoint
  height: number
  offset: number
}

function resolveSnapPointValue(
  snapPoint: DrawerSnapPoint,
  viewportHeight: number,
  rootFontSize: number
): number | null {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return null

  if (typeof snapPoint === 'number') {
    if (!Number.isFinite(snapPoint)) return null
    if (snapPoint <= 1) return clamp(snapPoint, 0, 1) * viewportHeight
    return snapPoint
  }

  const trimmed = snapPoint.trim()
  if (trimmed.endsWith('px')) {
    const value = Number.parseFloat(trimmed)
    return Number.isFinite(value) ? value : null
  }
  if (trimmed.endsWith('rem')) {
    const value = Number.parseFloat(trimmed)
    return Number.isFinite(value) ? value * rootFontSize : null
  }

  return null
}

/** Snap point whose offset is nearest to `offset`. `points` must not be empty. */
export function findClosestSnapPoint<T extends { offset: number }>(
  points: T[],
  offset: number
): { point: T; index: number } {
  let index = 0
  let closestDistance = Math.abs(offset - points[0].offset)
  for (let i = 1; i < points.length; i += 1) {
    const distance = Math.abs(offset - points[i].offset)
    if (distance < closestDistance) {
      closestDistance = distance
      index = i
    }
  }
  return { point: points[index], index }
}

type DrawerSnapPointsOptions = {
  viewportElement: HTMLElement | null
  snapPoints: DrawerSnapPoint[] | undefined
  activeSnapPoint: DrawerSnapPoint | null
  popupHeight: number
}

export class DrawerSnapPoints {
  #options: () => DrawerSnapPointsOptions

  #viewportHeight = $state(0)
  #rootFontSize = $state(16)

  #viewportElement = $derived.by(() => this.#options().viewportElement)

  resolvedSnapPoints = $derived.by<ResolvedDrawerSnapPoint[]>(() => {
    const { snapPoints, popupHeight } = this.#options()
    const viewportHeight = this.#viewportHeight
    const rootFontSize = this.#rootFontSize

    if (!snapPoints || snapPoints.length === 0 || viewportHeight <= 0 || popupHeight <= 0) {
      return []
    }

    const maxHeight = Math.min(popupHeight, viewportHeight)

    const resolved = snapPoints
      .map((value): ResolvedDrawerSnapPoint | null => {
        const resolvedHeight = resolveSnapPointValue(value, viewportHeight, rootFontSize)
        if (resolvedHeight === null) return null
        const clampedHeight = clamp(resolvedHeight, 0, maxHeight)
        return {
          value,
          height: clampedHeight,
          offset: Math.max(0, popupHeight - clampedHeight)
        }
      })
      .filter((point): point is ResolvedDrawerSnapPoint => Boolean(point))

    if (resolved.length <= 1) return resolved

    const deduped: ResolvedDrawerSnapPoint[] = []
    const seenHeights: number[] = []
    for (let index = resolved.length - 1; index >= 0; index -= 1) {
      const point = resolved[index]
      const isDuplicate = seenHeights.some((height) => Math.abs(height - point.height) <= 1)
      if (isDuplicate) continue
      seenHeights.push(point.height)
      deduped.push(point)
    }
    deduped.reverse()
    return deduped
  })

  #resolvedActiveSnapPoint = $derived.by<ResolvedDrawerSnapPoint | undefined>(() => {
    const { activeSnapPoint, popupHeight } = this.#options()
    const viewportHeight = this.#viewportHeight
    const rootFontSize = this.#rootFontSize
    const resolvedSnapPoints = this.resolvedSnapPoints

    if (activeSnapPoint === null || resolvedSnapPoints.length === 0) return undefined

    const exactMatch = resolvedSnapPoints.find((point) => Object.is(point.value, activeSnapPoint))
    if (exactMatch) return exactMatch

    const maxHeight = Math.min(popupHeight, viewportHeight)
    const resolvedHeight = resolveSnapPointValue(activeSnapPoint, viewportHeight, rootFontSize)
    if (resolvedHeight === null) return undefined
    const clampedHeight = clamp(resolvedHeight, 0, maxHeight)
    return findClosestSnapPoint(resolvedSnapPoints, popupHeight - clampedHeight).point
  })

  activeSnapPointOffset = $derived(this.#resolvedActiveSnapPoint?.offset ?? null)

  constructor(options: () => DrawerSnapPointsOptions) {
    this.#options = options

    $effect(() => {
      const viewportElement = this.#viewportElement
      this.#measure()

      if (!viewportElement) return
      const observer = new ResizeObserver(() => this.#measure())
      observer.observe(viewportElement)
      return () => observer.disconnect()
    })
  }

  #measure = () => {
    const viewportElement = this.#viewportElement
    const html = (viewportElement?.ownerDocument ?? globalThis.document).documentElement

    this.#viewportHeight = viewportElement ? viewportElement.offsetHeight : html.clientHeight

    const fontSize = parseFloat(getComputedStyle(html).fontSize)
    if (Number.isFinite(fontSize)) this.#rootFontSize = fontSize
  }
}
