import { isMac, isWebKit } from '$lib/internal/detect-browser'
import { contains, getTarget } from '$lib/internal/dom'
import { matchesFocusVisible } from '$lib/internal/floating/element'
import { isTypeableElement } from '$lib/internal/floating/tabbable'
import { REASONS, type ChangeEventReason } from '$lib/internal/reasons'
import { Timeout } from '$lib/internal/timeout'
import { on } from 'svelte/events'
import type { PopupTriggerMap } from '../popup-trigger-map'
import { isInsideEnabledTrigger } from './hover/predicates'

const isMacSafari = isMac && isWebKit

type FocusReferenceOptions = {
  enabled?: boolean
  open: boolean
  openChangeReason: ChangeEventReason | null | undefined
  triggerElement: HTMLElement | null
  activeTriggerElement: Element | null
  popupElement: HTMLElement | null
  triggerElements: PopupTriggerMap
  delay?: number
  setOpen(open: boolean, reason?: string, event?: Event, trigger?: HTMLElement | null): void
}

export function createFocusReference(options: () => FocusReferenceOptions) {
  let blocked = false
  let blockedTrigger: Element | null = null
  let keyboardModality = true
  const timeout = new Timeout()

  const enabled = $derived(options().enabled ?? true)
  const triggerElement = $derived(options().triggerElement)

  function reset(): void {
    blocked = false
    blockedTrigger = null
  }

  function shouldOpen(event: FocusEvent): boolean {
    if (!enabled) return false

    if (blocked) {
      if (blockedTrigger === triggerElement) return false
      reset()
    }

    const target = getTarget(event)
    if (!target) return true

    if (isMacSafari && !event.relatedTarget) {
      return keyboardModality || isTypeableElement(target)
    }
    return matchesFocusVisible(target)
  }

  $effect(timeout.disposeEffect)

  $effect(() => {
    if (!enabled) return

    const win = triggerElement?.ownerDocument.defaultView ?? window

    const onWindowBlur = () => {
      const current = triggerElement
      if (!options().open && current && current.ownerDocument.activeElement === current) {
        blocked = true
      }
    }

    const cleanups = [on(win, 'blur', onWindowBlur)]

    // Safari fails to match `:focus-visible` when focus was initially outside the document,
    // so the modality has to be tracked by hand there.
    if (isMacSafari) {
      cleanups.push(
        on(win, 'keydown', () => (keyboardModality = true), { capture: true }),
        on(win, 'pointerdown', () => (keyboardModality = false), { capture: true })
      )
    }

    return () => cleanups.forEach((cleanup) => cleanup())
  })

  let wasOpen = options().open
  $effect(() => {
    const open = options().open
    const reason = options().openChangeReason
    const active = options().activeTriggerElement
    if (
      wasOpen &&
      !open &&
      (reason === REASONS.triggerPress || reason === REASONS.escapeKey) &&
      active
    ) {
      blockedTrigger = active
      blocked = true
    }
    wasOpen = open
  })

  return {
    reset,

    onfocus: (event: FocusEvent): void => {
      if (!shouldOpen(event)) return

      const element = triggerElement
      if (!element) return

      const delay = options().delay
      const movedFromOtherEnabledTrigger = isInsideEnabledTrigger(
        event.relatedTarget,
        options().triggerElements
      )

      if ((options().open && movedFromOtherEnabledTrigger) || !delay) {
        timeout.clear()
        options().setOpen(true, REASONS.triggerFocus, event, element)
        return
      }

      timeout.start(delay, () => {
        if (blocked) return
        options().setOpen(true, REASONS.triggerFocus, event, element)
      })
    },

    onblur: (event: FocusEvent): void => {
      const relatedTarget = event.relatedTarget

      reset()

      timeout.start(0, () => {
        if (!options().open) return

        const element = triggerElement
        const active = (element?.ownerDocument ?? document).activeElement

        if (!relatedTarget && active === element) return
        if (contains(options().popupElement, active)) return
        if (contains(element, active)) return
        if (isInsideEnabledTrigger(relatedTarget ?? active, options().triggerElements)) return

        options().setOpen(false, REASONS.triggerFocus)
      })
    }
  }
}
