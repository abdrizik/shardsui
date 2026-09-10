import { isHTMLElement } from '@floating-ui/utils/dom'
import { untrack } from 'svelte'
import type { PopupTriggerMap } from './popup-trigger-map'

type DetachedTriggerSelectionOptions = {
  triggerElements: PopupTriggerMap
  triggerId: string | null
  open: boolean
  triggerElement: HTMLElement | null
  setTriggerElement: (element: HTMLElement) => void
}

export function detachedTriggerSelection(options: () => DetachedTriggerSelectionOptions): void {
  const triggerElements = options().triggerElements

  const triggerId = $derived(options().triggerId)
  const open = $derived(options().open)
  const triggerElement = $derived(options().triggerElement)

  $effect.pre(() => {
    if (!triggerId) return
    const el = triggerElements.getById(triggerId)
    if (el) untrack(() => options().setTriggerElement(el))
  })

  $effect.pre(() => {
    if (open && triggerElement == null && triggerElements.size === 1) {
      const [[, el]] = triggerElements.entries()
      untrack(() => options().setTriggerElement(el))
    }
  })
}

export type ActiveTriggerSelection = {
  setActiveTriggerId: (id: string | null) => void
  setTriggerElement: (element: HTMLElement | null) => void
  applyTriggerBindings: (id: string | null) => void
}

export function selectActiveTrigger(
  selection: ActiveTriggerSelection,
  open: boolean,
  trigger: HTMLElement | null | undefined
): void {
  const triggerId = trigger?.id || null
  if (!triggerId && !open) return

  selection.setActiveTriggerId(triggerId)
  if (!open) return

  if (isHTMLElement(trigger)) selection.setTriggerElement(trigger)
  selection.applyTriggerBindings(triggerId)
}

type DetachedTriggerSelectionByIdOptions = ActiveTriggerSelection & {
  triggerElements: PopupTriggerMap
  triggerId: string | null
  open: boolean
  activeTriggerId: string | null
  triggerElement: HTMLElement | null
  closeOnActiveTriggerUnmount?: (() => boolean) | undefined
}

export function detachedTriggerSelectionById(
  options: () => DetachedTriggerSelectionByIdOptions
): void {
  const triggerElements = options().triggerElements

  const triggerId = $derived(options().triggerId)
  const open = $derived(options().open)
  const activeTriggerId = $derived(options().activeTriggerId)
  const triggerElement = $derived(options().triggerElement)

  $effect.pre(() => {
    if (!triggerId) return
    untrack(() => options().setActiveTriggerId(triggerId))
    if (open) untrack(() => options().applyTriggerBindings(triggerId))
  })

  $effect.pre(() => {
    if (open && activeTriggerId == null && triggerElements.size === 1) {
      const [[id, el]] = triggerElements.entries()
      untrack(() => {
        options().setActiveTriggerId(id)
        options().setTriggerElement(el)
        options().applyTriggerBindings(id)
      })
    }
  })

  $effect(() => {
    if (!activeTriggerId) return
    const el = triggerElements.getById(activeTriggerId)
    if (el && triggerElement !== el) {
      untrack(() => options().setTriggerElement(el))
    }
  })

  $effect(() => {
    if (!open) return

    const lostTriggerId = activeTriggerId
    if (!lostTriggerId) return
    if (triggerElements.getById(lostTriggerId)) return

    // Deferred so a replacement trigger with the same id can register first.
    queueMicrotask(() => {
      const current = options()
      if (
        !current.open ||
        current.activeTriggerId !== lostTriggerId ||
        triggerElements.getById(lostTriggerId)
      ) {
        return
      }
      if (!current.closeOnActiveTriggerUnmount?.()) return
      current.setActiveTriggerId(null)
      current.setTriggerElement(null)
    })
  })
}
