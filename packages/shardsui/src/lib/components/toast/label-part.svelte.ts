import { ToastContext } from './context'

type ToastLabelPartOptions = {
  part: 'title' | 'description'
  id: string
  hasChildren: boolean
}

export class ToastLabelPart {
  #options: () => ToastLabelPartOptions
  #toastRoot = ToastContext.get()

  type = $derived(this.#toastRoot.toast.type)
  content = $derived.by(() =>
    this.#options().part === 'title'
      ? this.#toastRoot.toast.title
      : this.#toastRoot.toast.description
  )
  shouldRender = $derived.by(() => Boolean(this.#options().hasChildren || this.content))

  constructor(options: () => ToastLabelPartOptions) {
    this.#options = options

    $effect.pre(() => {
      if (!this.shouldRender) return
      return this.#toastRoot.registerLabelId(this.#options().part, this.#options().id)
    })
  }
}
