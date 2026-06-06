import { isHTMLElement } from '@floating-ui/utils/dom'
import { contains } from '../dom'
import {
  getNextTabbable,
  getTabbableAfterElement,
  getTabbableBeforeElement,
  isOutsideEvent
} from './tabbable'

type TriggerFocusGuardsOptions = {
  close: (event: FocusEvent) => void
  positionerElement: HTMLElement | null
  popupElement: HTMLElement | null
  triggerFocusTargetElement: HTMLElement | null
}

export class TriggerFocusGuards {
  preFocusGuardElement = $state<HTMLElement | null>(null)

  #options: () => TriggerFocusGuardsOptions

  constructor(options: () => TriggerFocusGuardsOptions) {
    this.#options = options
  }

  closeAndFocusBefore = (event: FocusEvent): void => {
    this.#options().close(event)
    getTabbableBeforeElement(this.preFocusGuardElement)?.focus()
  }

  closeAndFocusAfter = (event: FocusEvent): void => {
    const positionerElement = this.#options().positionerElement

    if (positionerElement && isOutsideEvent(event, positionerElement)) {
      const beforeGuard = this.#options().popupElement?.previousElementSibling
      if (isHTMLElement(beforeGuard)) {
        beforeGuard.focus()
        return
      }
    }

    const focusTarget = this.#options().triggerFocusTargetElement

    this.#options().close(event)

    let nextTabbable = getTabbableAfterElement(focusTarget)
    while (nextTabbable !== null && contains(positionerElement, nextTabbable)) {
      const prevTabbable = nextTabbable
      nextTabbable = getNextTabbable(nextTabbable)
      if (nextTabbable === prevTabbable) break
    }

    nextTabbable?.focus()
  }
}
