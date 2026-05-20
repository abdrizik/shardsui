import { cancelAnimationFrameTick, requestAnimationFrameTick } from './animation-frame.svelte'

export type TransitionStatus = 'starting' | 'ending' | 'idle' | undefined

type TransitionStatusOptions = {
  open: boolean
  idle?: boolean
}

export class Transition {
  mounted = $state(false)
  status = $state<TransitionStatus>(undefined)

  #options: () => TransitionStatusOptions

  #open = $derived.by(() => this.#options().open)
  #idle = $derived.by(() => this.#options().idle)

  constructor(options: () => TransitionStatusOptions) {
    this.#options = options

    const initial = options()
    this.mounted = initial.open
    this.status = initial.open && initial.idle ? 'idle' : undefined

    $effect.pre(() => {
      const open = this.#open
      const idle = this.#idle

      if (open && !this.mounted) {
        this.mounted = true
        this.status = 'starting'
      }

      if (!open && this.mounted && this.status !== 'ending' && !idle) {
        this.status = 'ending'
      }

      if (!open && !this.mounted && this.status === 'ending') {
        this.status = undefined
      }
    })

    $effect(() => {
      if (this.#open) {
        const idle = this.#idle
        if (idle && this.mounted && this.status !== 'idle') {
          this.status = 'starting'
        }
        const frame = requestAnimationFrameTick(() => {
          this.status = idle ? 'idle' : undefined
        })
        return () => {
          cancelAnimationFrameTick(frame)
        }
      }

      if (!this.mounted || this.status === 'ending' || !this.#idle) return
      const frame = requestAnimationFrameTick(() => {
        this.status = 'ending'
      })
      return () => {
        cancelAnimationFrameTick(frame)
      }
    })
  }
}
