import { getDelay, type Delay } from '$lib/internal/floating/hover/predicates'
import type { HoverContext } from '$lib/internal/floating/types'
import { REASONS } from '$lib/internal/reasons'
import { Timeout } from '$lib/internal/timeout'
import { untrack } from 'svelte'

type CurrentContext = {
  onOpenChange: (open: boolean, reason?: string, event?: Event) => void
  setIsInstantPhase: (value: boolean) => void
}

type DelayGroupOptions = {
  delay: Delay
  timeoutMs: number
}

export class DelayGroup {
  #options: () => DelayGroupOptions

  delay = $state.raw<Delay>({})
  initialDelay: Delay
  currentId: string | null = null
  currentContext: CurrentContext | null = null
  timeout = new Timeout()

  timeoutMs = $derived.by(() => this.#options().timeoutMs)

  constructor(options: () => DelayGroupOptions) {
    this.#options = options

    const initial = options().delay
    this.delay = initial
    this.initialDelay = initial

    $effect.pre(() => {
      const delay = this.#options().delay
      // The merge below reads `this.delay`; tracking that read would re-run this on its own write.
      untrack(() => this.#applyDelay(delay))
    })

    $effect(this.timeout.disposeEffect)
  }

  #applyDelay(delay: Delay): void {
    this.initialDelay = delay
    if (this.currentId == null) {
      this.delay = delay
      return
    }
    this.delay = {
      open: getDelay(this.delay, 'open'),
      close: getDelay(delay, 'close')
    }
  }
}

type DelayGroupMemberOptions = {
  open: boolean
  floatingId: string | undefined
}

export class DelayGroupMember {
  #group: DelayGroup
  #tooltip: HoverContext
  #options: () => DelayGroupMemberOptions

  isInstantPhase = $state(false)

  #open = $derived.by(() => this.#options().open)
  #floatingId = $derived.by(() => this.#options().floatingId)

  // Effect cleanups run after the deriveds they read have been destroyed, so every value a cleanup
  // needs is either captured in the effect body or mirrored here.
  #latestOpen = false

  constructor(group: DelayGroup, tooltip: HoverContext, options: () => DelayGroupMemberOptions) {
    this.#group = group
    this.#tooltip = tooltip
    this.#options = options

    $effect(() => {
      this.#latestOpen = this.#open
    })

    $effect(() => this.#holdGroupAfterClose())
    $effect(() => this.#claimGroupOnOpen())
    $effect(() => this.#releaseGroupOnDestroy())
  }

  #holdGroupAfterClose(): (() => void) | undefined {
    const group = this.#group
    const isOpen = this.#open
    const currentId = this.#floatingId ?? null

    return untrack(() => {
      if (!group.currentId || isOpen || group.currentId !== currentId) {
        return undefined
      }

      const unset = () => {
        this.isInstantPhase = false
        group.currentContext?.setIsInstantPhase(false)
        group.currentId = null
        group.currentContext = null
        group.delay = group.initialDelay
        group.timeout.clear()
      }

      this.isInstantPhase = false

      if (!group.timeoutMs) {
        unset()
        return undefined
      }

      group.timeout.start(group.timeoutMs, () => {
        if (this.#tooltip.open || (group.currentId && group.currentId !== currentId)) {
          return
        }
        unset()
      })

      return () => {
        if (group.currentId !== currentId) {
          group.timeout.clear()
        }
      }
    })
  }

  #claimGroupOnOpen(): void {
    const group = this.#group
    const isOpen = this.#open
    const currentId = this.#floatingId ?? null
    if (!isOpen) {
      return
    }

    untrack(() => {
      const prevContext = group.currentContext
      const prevId = group.currentId

      group.timeout.clear()
      group.currentContext = {
        onOpenChange: (openValue, reason, event) => this.#tooltip.setOpen(openValue, reason, event),
        setIsInstantPhase: (value) => {
          this.isInstantPhase = value
        }
      }
      group.currentId = currentId
      group.delay = {
        open: 0,
        close: getDelay(group.initialDelay, 'close') ?? 0
      }

      const tookOverFromAnotherTrigger = prevId !== null && prevId !== currentId
      this.isInstantPhase = tookOverFromAnotherTrigger
      prevContext?.setIsInstantPhase(tookOverFromAnotherTrigger)
      if (tookOverFromAnotherTrigger) {
        prevContext?.onOpenChange(false, REASONS.none)
      }
    })
  }

  #releaseGroupOnDestroy(): () => void {
    const group = this.#group
    const closingId = this.#floatingId ?? null

    return () => {
      if (group.currentId !== closingId) return

      group.currentContext = null
      if (!this.#latestOpen) return

      group.currentId = null
      group.delay = group.initialDelay
      group.timeout.clear()
    }
  }
}
