import { isElement } from '@floating-ui/utils/dom'
import { contains, getTarget } from '../dom'
import { Timeout } from '../timeout'
import { getNodeChildren } from './floating-tree.svelte'
import type { CloseGuard, CloseGuardOptions } from './hover/predicates'

// Cursor speed in CSS pixels per millisecond; kept squared so the comparison can skip the root.
const CURSOR_SPEED_THRESHOLD = 0.1
const CURSOR_SPEED_THRESHOLD_SQUARED = CURSOR_SPEED_THRESHOLD * CURSOR_SPEED_THRESHOLD
const POLYGON_BUFFER = 0.5
const LANDING_GRACE_MS = 40

type RectLike = {
  x: number
  y: number
  width: number
  height: number
}

function hasIntersectingEdge(
  pointX: number,
  pointY: number,
  xi: number,
  yi: number,
  xj: number,
  yj: number
): boolean {
  return yi >= pointY !== yj >= pointY && pointX <= ((xj - xi) * (pointY - yi)) / (yj - yi) + xi
}

function isPointInQuadrilateral(
  pointX: number,
  pointY: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): boolean {
  let isInsideValue = false
  if (hasIntersectingEdge(pointX, pointY, x1, y1, x2, y2)) isInsideValue = !isInsideValue
  if (hasIntersectingEdge(pointX, pointY, x2, y2, x3, y3)) isInsideValue = !isInsideValue
  if (hasIntersectingEdge(pointX, pointY, x3, y3, x4, y4)) isInsideValue = !isInsideValue
  if (hasIntersectingEdge(pointX, pointY, x4, y4, x1, y1)) isInsideValue = !isInsideValue
  return isInsideValue
}

function isInsideRect(pointX: number, pointY: number, rect: RectLike): boolean {
  return (
    pointX >= rect.x &&
    pointX <= rect.x + rect.width &&
    pointY >= rect.y &&
    pointY <= rect.y + rect.height
  )
}

function isInsideAxisAlignedRect(
  pointX: number,
  pointY: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  const minX = Math.min(x1, x2)
  const maxX = Math.max(x1, x2)
  const minY = Math.min(y1, y2)
  const maxY = Math.max(y1, y2)
  return pointX >= minX && pointX <= maxX && pointY >= minY && pointY <= maxY
}

export function safePolygon(options: () => CloseGuardOptions = () => ({})): CloseGuard {
  const timeout = new Timeout()
  $effect(timeout.disposeEffect)

  const fn: CloseGuard = ({ x, y, side, elements, onClose, nodeId, tree }) => {
    let hasLanded = false
    let lastX: number | null = null
    let lastY: number | null = null
    let lastCursorTime = performance.now()

    function isCursorMovingSlowly(nextX: number, nextY: number): boolean {
      const currentTime = performance.now()
      const elapsedTime = currentTime - lastCursorTime

      if (lastX === null || lastY === null || elapsedTime === 0) {
        lastX = nextX
        lastY = nextY
        lastCursorTime = currentTime
        return false
      }

      const deltaX = nextX - lastX
      const deltaY = nextY - lastY
      const distanceSquared = deltaX * deltaX + deltaY * deltaY
      const thresholdSquared = elapsedTime * elapsedTime * CURSOR_SPEED_THRESHOLD_SQUARED

      lastX = nextX
      lastY = nextY
      lastCursorTime = currentTime

      return distanceSquared < thresholdSquared
    }

    function hasOpenChildNode(): boolean {
      return Boolean(tree && nodeId && getNodeChildren(tree.nodes, nodeId).length > 0)
    }

    function closeIfNoOpenChild() {
      if (hasOpenChildNode()) return
      timeout.clear()
      onClose()
    }

    return function onmousemove(event: MouseEvent) {
      timeout.clear()

      const domReference = elements.domReference
      const floating = elements.floating
      if (!domReference || !floating) return

      const { clientX, clientY } = event
      const target = getTarget(event)
      const isLeave = event.type === 'mouseleave'
      const isOverFloating = contains(floating, target)
      const isOverReference = contains(domReference, target)

      if (isOverFloating) {
        hasLanded = true
        if (!isLeave) return
      }

      if (isOverReference) {
        hasLanded = !isLeave
        if (!isLeave) return
      }

      if (isLeave && isElement(event.relatedTarget) && contains(floating, event.relatedTarget)) {
        return
      }

      if (hasOpenChildNode()) {
        return
      }

      const refRect = domReference.getBoundingClientRect()
      const rect = floating.getBoundingClientRect()
      const cursorLeaveFromRight = x > rect.right - rect.width / 2
      const cursorLeaveFromBottom = y > rect.bottom - rect.height / 2
      const isFloatingWider = rect.width > refRect.width
      const isFloatingTaller = rect.height > refRect.height
      const left = (isFloatingWider ? refRect : rect).left
      const right = (isFloatingWider ? refRect : rect).right
      const top = (isFloatingTaller ? refRect : rect).top
      const bottom = (isFloatingTaller ? refRect : rect).bottom

      // A constant of 1 handles floating point rounding errors.
      if (
        (side === 'top' && y >= refRect.bottom - 1) ||
        (side === 'bottom' && y <= refRect.top + 1) ||
        (side === 'left' && x >= refRect.right - 1) ||
        (side === 'right' && x <= refRect.left + 1)
      ) {
        closeIfNoOpenChild()
        return
      }

      let isInsideTroughRect = false

      switch (side) {
        case 'top':
          isInsideTroughRect = isInsideAxisAlignedRect(
            clientX,
            clientY,
            left,
            refRect.top + 1,
            right,
            rect.bottom - 1
          )
          break
        case 'bottom':
          isInsideTroughRect = isInsideAxisAlignedRect(
            clientX,
            clientY,
            left,
            rect.top + 1,
            right,
            refRect.bottom - 1
          )
          break
        case 'left':
          isInsideTroughRect = isInsideAxisAlignedRect(
            clientX,
            clientY,
            rect.right - 1,
            bottom,
            refRect.left + 1,
            top
          )
          break
        case 'right':
          isInsideTroughRect = isInsideAxisAlignedRect(
            clientX,
            clientY,
            refRect.right - 1,
            bottom,
            rect.left + 1,
            top
          )
          break
      }

      if (isInsideTroughRect) {
        return
      }

      if (hasLanded && !isInsideRect(clientX, clientY, refRect)) {
        closeIfNoOpenChild()
        return
      }

      if (!isLeave && isCursorMovingSlowly(clientX, clientY)) {
        closeIfNoOpenChild()
        return
      }

      let isInsidePolygon = false

      switch (side) {
        case 'top': {
          const cursorXOffset = isFloatingWider ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4
          const cursorPointOneX = isFloatingWider
            ? x + cursorXOffset
            : cursorLeaveFromRight
              ? x + cursorXOffset
              : x - cursorXOffset
          const cursorPointTwoX = isFloatingWider
            ? x - cursorXOffset
            : cursorLeaveFromRight
              ? x + cursorXOffset
              : x - cursorXOffset
          const cursorPointY = y + POLYGON_BUFFER + 1
          const commonYLeft = cursorLeaveFromRight
            ? rect.bottom - POLYGON_BUFFER
            : isFloatingWider
              ? rect.bottom - POLYGON_BUFFER
              : rect.top
          const commonYRight = cursorLeaveFromRight
            ? isFloatingWider
              ? rect.bottom - POLYGON_BUFFER
              : rect.top
            : rect.bottom - POLYGON_BUFFER
          isInsidePolygon = isPointInQuadrilateral(
            clientX,
            clientY,
            cursorPointOneX,
            cursorPointY,
            cursorPointTwoX,
            cursorPointY,
            rect.left,
            commonYLeft,
            rect.right,
            commonYRight
          )
          break
        }
        case 'bottom': {
          const cursorXOffset = isFloatingWider ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4
          const cursorPointOneX = isFloatingWider
            ? x + cursorXOffset
            : cursorLeaveFromRight
              ? x + cursorXOffset
              : x - cursorXOffset
          const cursorPointTwoX = isFloatingWider
            ? x - cursorXOffset
            : cursorLeaveFromRight
              ? x + cursorXOffset
              : x - cursorXOffset
          const cursorPointY = y - POLYGON_BUFFER
          const commonYLeft = cursorLeaveFromRight
            ? rect.top + POLYGON_BUFFER
            : isFloatingWider
              ? rect.top + POLYGON_BUFFER
              : rect.bottom
          const commonYRight = cursorLeaveFromRight
            ? isFloatingWider
              ? rect.top + POLYGON_BUFFER
              : rect.bottom
            : rect.top + POLYGON_BUFFER
          isInsidePolygon = isPointInQuadrilateral(
            clientX,
            clientY,
            cursorPointOneX,
            cursorPointY,
            cursorPointTwoX,
            cursorPointY,
            rect.left,
            commonYLeft,
            rect.right,
            commonYRight
          )
          break
        }
        case 'left': {
          const cursorYOffset = isFloatingTaller ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4
          const cursorPointOneY = isFloatingTaller
            ? y + cursorYOffset
            : cursorLeaveFromBottom
              ? y + cursorYOffset
              : y - cursorYOffset
          const cursorPointTwoY = isFloatingTaller
            ? y - cursorYOffset
            : cursorLeaveFromBottom
              ? y + cursorYOffset
              : y - cursorYOffset
          const cursorPointX = x + POLYGON_BUFFER + 1
          const commonXTop = cursorLeaveFromBottom
            ? rect.right - POLYGON_BUFFER
            : isFloatingTaller
              ? rect.right - POLYGON_BUFFER
              : rect.left
          const commonXBottom = cursorLeaveFromBottom
            ? isFloatingTaller
              ? rect.right - POLYGON_BUFFER
              : rect.left
            : rect.right - POLYGON_BUFFER
          isInsidePolygon = isPointInQuadrilateral(
            clientX,
            clientY,
            commonXTop,
            rect.top,
            commonXBottom,
            rect.bottom,
            cursorPointX,
            cursorPointOneY,
            cursorPointX,
            cursorPointTwoY
          )
          break
        }
        case 'right': {
          const cursorYOffset = isFloatingTaller ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4
          const cursorPointOneY = isFloatingTaller
            ? y + cursorYOffset
            : cursorLeaveFromBottom
              ? y + cursorYOffset
              : y - cursorYOffset
          const cursorPointTwoY = isFloatingTaller
            ? y - cursorYOffset
            : cursorLeaveFromBottom
              ? y + cursorYOffset
              : y - cursorYOffset
          const cursorPointX = x - POLYGON_BUFFER
          const commonXTop = cursorLeaveFromBottom
            ? rect.left + POLYGON_BUFFER
            : isFloatingTaller
              ? rect.left + POLYGON_BUFFER
              : rect.right
          const commonXBottom = cursorLeaveFromBottom
            ? isFloatingTaller
              ? rect.left + POLYGON_BUFFER
              : rect.right
            : rect.left + POLYGON_BUFFER
          isInsidePolygon = isPointInQuadrilateral(
            clientX,
            clientY,
            cursorPointX,
            cursorPointOneY,
            cursorPointX,
            cursorPointTwoY,
            commonXTop,
            rect.top,
            commonXBottom,
            rect.bottom
          )
          break
        }
      }

      if (!isInsidePolygon) {
        closeIfNoOpenChild()
      } else if (!hasLanded) {
        timeout.start(LANDING_GRACE_MS, closeIfNoOpenChild)
      }
    }
  }

  fn.options = options

  return fn
}
