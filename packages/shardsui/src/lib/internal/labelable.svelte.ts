import { untrack } from 'svelte'

export type LabelableContextValue = {
  readonly controlId: string | undefined
  registerControlId: (id: string | undefined) => () => void
  labelId: string | undefined
  messageIds: string[]
  registerMessageId: (id: string) => () => void
}

export const DEFAULT_LABELABLE: LabelableContextValue = {
  controlId: undefined,
  registerControlId: () => () => {},
  get labelId() {
    return undefined
  },
  set labelId(_value) {},
  messageIds: [],
  registerMessageId: () => () => {}
}

export function mergeDescribedBy(
  external: string | null | undefined,
  messageIds: string[]
): string | undefined {
  const ids: string[] = []
  for (const id of external ? external.split(' ') : []) {
    if (id && !ids.includes(id)) ids.push(id)
  }
  for (const id of messageIds) {
    if (!ids.includes(id)) ids.push(id)
  }
  return ids.join(' ') || undefined
}

export class Labelable implements LabelableContextValue {
  labelId = $state<string | undefined>(undefined)

  #parent: LabelableContextValue | undefined
  #controlIds = $state<string[]>([])
  #own = $state<string[]>([])

  controlId = $derived(this.#controlIds[0])

  messageIds = $derived.by(() =>
    this.#parent ? [...this.#parent.messageIds, ...this.#own] : this.#own
  )

  constructor(parent?: LabelableContextValue) {
    this.#parent = parent
  }

  // Callers register from an `$effect`; `push`/`splice` read the array's length, so a tracked
  // mutation would make that effect depend on the list it just wrote and re-run forever.
  #register = (list: string[], id: string) => {
    untrack(() => list.push(id))
    return () =>
      untrack(() => {
        const index = list.indexOf(id)
        if (index !== -1) list.splice(index, 1)
      })
  }

  registerControlId = (id: string | undefined) =>
    id === undefined ? () => {} : this.#register(this.#controlIds, id)

  registerMessageId = (id: string) => this.#register(this.#own, id)
}
