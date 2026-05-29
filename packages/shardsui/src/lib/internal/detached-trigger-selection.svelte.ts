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

type DetachedTriggerSelectionByIdOptions = {
  triggerElements: PopupTriggerMap
  triggerId: string | null
  open: boolean
  activeTriggerId: string | null
  triggerElement: HTMLElement | null
  setActiveTriggerId: (id: string | null) => void
  setTriggerElement: (element: HTMLElement) => void
  applyTriggerBindings: (id: string | null) => void
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
}
