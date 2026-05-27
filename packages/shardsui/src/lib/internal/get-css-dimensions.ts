import { type Dimensions, round } from '@floating-ui/utils'
import { getComputedStyle, isHTMLElement } from '@floating-ui/utils/dom'

export function getCssDimensions(element: Element): Dimensions {
  const css = getComputedStyle(element)
  // JSDOM reports computed `width`/`height` as empty strings for SVG elements, so parseFloat is NaN.
  let width = parseFloat(css.width) || 0
  let height = parseFloat(css.height) || 0
  const isHtml = isHTMLElement(element)
  const offsetWidth = isHtml ? element.offsetWidth : width
  const offsetHeight = isHtml ? element.offsetHeight : height

  if (round(width) !== offsetWidth || round(height) !== offsetHeight) {
    width = offsetWidth
    height = offsetHeight
  }

  return { width, height }
}
