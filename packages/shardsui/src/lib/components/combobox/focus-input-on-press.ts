import { getTarget } from '$lib/internal/dom'
import { isInteractiveElement } from '$lib/internal/floating/hover/predicates'
import { REASONS } from '$lib/internal/reasons'
import { isElement } from '@floating-ui/utils/dom'
import type { ComboboxRoot } from './combobox.svelte'

export function focusInputOnPress(
  event: MouseEvent,
  combobox: ComboboxRoot,
  container: HTMLElement | null,
  shouldIgnoreTarget?: (target: Element | null) => boolean
): void {
  if (combobox.readOnly) return

  const target = getTarget(event)
  const targetElement = isElement(target) ? target : null
  if (
    targetElement !== container &&
    (shouldIgnoreTarget?.(targetElement) || isInteractiveElement(targetElement))
  ) {
    return
  }

  event.preventDefault()
  if (combobox.disabled) return
  combobox.inputElement?.focus()
  if (combobox.openOnInputClick) combobox.setOpen(true, REASONS.inputPress, event)
}
