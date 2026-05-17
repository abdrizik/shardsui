import { AnimationFrame } from '$lib/internal/animation-frame.svelte'
import { warn } from '$lib/internal/log'
import type { PopupTriggerMap } from '$lib/internal/popup-trigger-map'
import { REASONS } from '$lib/internal/reasons'
import { DEV } from 'esm-env'

type TriggerMapState = {
  open: boolean
  attached: boolean
  triggerElements: PopupTriggerMap
  setOpen: (
    open: boolean,
    reason: typeof REASONS.imperativeAction,
    event?: Event,
    trigger?: HTMLElement | null
  ) => unknown
}

type MenuLikeState = TriggerMapState & {
  triggerElement: HTMLElement | null
}

export class RootAttachments<Attachment> {
  #entries: Attachment[] = []
  #componentName: string
  #onActiveChange: (attachment: Attachment | null) => void
  #overlapFrame: AnimationFrame | undefined

  constructor(componentName: string, onActiveChange: (attachment: Attachment | null) => void) {
    this.#componentName = componentName
    this.#onActiveChange = onActiveChange
  }

  add(attachment: Attachment): () => void {
    this.#entries.push(attachment)

    if (DEV && this.#entries.length > 1) {
      this.#overlapFrame ??= new AnimationFrame()
      this.#overlapFrame.request(() => {
        if (this.#entries.length > 1) {
          warn(
            `A ${this.#componentName} handle is attached to more than one mounted root at the same time.`,
            'The most recently mounted root takes over and the previous one stops being controlled by the handle.',
            'A handle should be used by a single root that stays mounted for the lifetime of the handle.'
          )
        }
      })
    }

    return () => {
      const index = this.#entries.lastIndexOf(attachment)
      if (index === -1) return
      this.#entries.splice(index, 1)
      if (this.#entries.length <= 1) this.#overlapFrame?.cancel()
      this.#onActiveChange(this.#entries[this.#entries.length - 1] ?? null)
    }
  }
}

export abstract class DetachedHandle<State extends TriggerMapState> {
  protected readonly root: State
  #componentName: string
  #throwOnMissingTrigger: boolean

  constructor(root: State, componentName: string, throwOnMissingTrigger = true) {
    this.root = root
    this.#componentName = componentName
    this.#throwOnMissingTrigger = throwOnMissingTrigger
  }

  get state(): State {
    return this.root
  }

  protected abstract openWithTrigger(trigger: HTMLElement | null): void

  open = (triggerId: string): void => {
    this.openByTrigger(triggerId)
  }

  protected openByTrigger(triggerId: string | null | undefined): void {
    const current = this.state
    if (!current.attached) {
      warn(
        `${this.#componentName}Handle.open() was called while no root using this handle is mounted.`,
        'The call was ignored; mount a root with this handle before opening it imperatively.'
      )
      return
    }

    const trigger = triggerId ? (current.triggerElements.getById(triggerId) ?? null) : null

    if (triggerId && !trigger) {
      if (this.#throwOnMissingTrigger) {
        throw new Error(
          `ShardsUI: ${this.#componentName}Handle.open: No trigger found with id "${triggerId}". ` +
            'An anchored popup cannot open without a trigger to anchor to. Pass the id of a mounted ' +
            `${this.#componentName}.Trigger that has this handle set on its "handle" prop.`
        )
      }
      warn(
        `${this.#componentName}Handle.open: No trigger found with id "${triggerId}".`,
        'The popup will open, but the trigger will not be associated with it.'
      )
    }

    this.openWithTrigger(trigger)
  }

  close = (): void => {
    const current = this.state
    if (!current.attached) {
      warn(
        `${this.#componentName}Handle.close() was called while no root using this handle is mounted.`,
        'The call was ignored.'
      )
      return
    }
    current.setOpen(false, REASONS.imperativeAction)
  }

  get isOpen(): boolean {
    return this.state.open
  }
}

export class TriggerMapHandle<State extends TriggerMapState> extends DetachedHandle<State> {
  protected openWithTrigger(trigger: HTMLElement | null): void {
    this.state.setOpen(true, REASONS.imperativeAction, undefined, trigger)
  }
}

export class MenuLikeHandle<State extends MenuLikeState> extends DetachedHandle<State> {
  protected openWithTrigger(trigger: HTMLElement | null): void {
    this.state.triggerElement = trigger
    this.state.setOpen(true, REASONS.imperativeAction)
  }
}
