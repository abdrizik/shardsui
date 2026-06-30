import { getPseudoElementBounds, isMouseWithinBounds } from '$lib/internal/pseudo-element-bounds'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'

function createElementWithRect(rect: DOMRectInit) {
  const element = document.createElement('div')
  element.getBoundingClientRect = () => DOMRect.fromRect(rect)
  return element
}

describe('getPseudoElementBounds', () => {
  it.skipIf(isJSDOM)('includes pseudo-element bounds in browsers', () => {
    const style = document.createElement('style')
    style.textContent = `
      .pseudo-element-bounds-test {
        position: absolute;
        left: 100px;
        top: 50px;
        width: 20px;
        height: 10px;
      }

      .pseudo-element-bounds-test::before {
        content: "";
        display: block;
        width: 40px;
        height: 30px;
      }
    `

    const element = document.createElement('div')
    element.className = 'pseudo-element-bounds-test'

    document.head.appendChild(style)
    document.body.appendChild(element)

    try {
      expect(getPseudoElementBounds(element)).toEqual({
        left: 90,
        right: 130,
        top: 40,
        bottom: 70
      })
    } finally {
      element.remove()
      style.remove()
    }
  })

  it('allows up to 5px of mouse drift around element bounds', () => {
    const element = createElementWithRect({ x: 100, y: 50, width: 20, height: 10 })

    const within = (clientX: number, clientY: number) =>
      isMouseWithinBounds(new MouseEvent('mouseup', { clientX, clientY }), element)

    expect(within(95, 55)).toBe(true)
    expect(within(94, 55)).toBe(false)
    expect(within(125, 55)).toBe(true)
    expect(within(126, 55)).toBe(false)
    expect(within(110, 45)).toBe(true)
    expect(within(110, 44)).toBe(false)
    expect(within(110, 65)).toBe(true)
    expect(within(110, 66)).toBe(false)
  })
})
