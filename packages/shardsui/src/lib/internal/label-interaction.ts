import { getTarget } from './dom'

type LabelInteractionOptions = {
  native?: boolean
  focusControl: () => void
}

export function focusElementWithVisible(element: HTMLElement) {
  element.focus({
    focusVisible: true
  })
}

export function labelInteraction(options: () => LabelInteractionOptions) {
  return {
    activateControl: (event: MouseEvent) => {
      const target = getTarget(event) as HTMLElement | null
      if (target?.closest('button,input,select,textarea')) return

      if (!event.defaultPrevented && event.detail > 1) event.preventDefault()

      if (options().native) return
      options().focusControl()
    }
  }
}
