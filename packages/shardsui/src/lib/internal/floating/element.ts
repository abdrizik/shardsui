import { isElement } from '@floating-ui/utils/dom'
import { FOCUSABLE_ATTRIBUTE } from '../constants'
import { isJSDOM } from '../detect-browser'

export function matchesFocusVisible(element: EventTarget | null): boolean {
  // jsdom implements `:focus-visible` but only matches it for elements that always qualify, such as
  // text inputs. A programmatically focused button or tabindex'd div matches in browsers, not there.
  if (!isElement(element) || isJSDOM) {
    return true
  }
  return element.matches(':focus-visible')
}

export function getFloatingFocusElement(floatingElement: HTMLElement): HTMLElement {
  if (floatingElement.hasAttribute(FOCUSABLE_ATTRIBUTE)) return floatingElement
  return floatingElement.querySelector<HTMLElement>(`[${FOCUSABLE_ATTRIBUTE}]`) ?? floatingElement
}
