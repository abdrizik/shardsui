import type { MenuOpenChangeEvent, MenuTreeEvents } from '$lib/components/menu/context'
import { Composite } from '$lib/internal/floating/composite.svelte'
import { attachFloatingNode } from '$lib/internal/floating/floating-tree.svelte'
import { REASONS } from '$lib/internal/reasons'
import type { Orientation } from '$lib/internal/types'

type MenubarRootOptions = {
  id: string
  modal: boolean
  disabled: boolean
  orientation: Orientation
  loopFocus: boolean
  ref: HTMLElement | null
}

export class MenubarRoot {
  #options: () => MenubarRootOptions
  #nodeId: string
  composite: Composite

  hasSubmenuOpen = $state(false)
  allowMouseUpTrigger = $state(false)

  rootId = $derived.by(() => this.#options().id)
  modal = $derived.by(() => this.#options().modal)
  disabled = $derived.by(() => this.#options().disabled)
  orientation = $derived.by(() => this.#options().orientation)
  ref = $derived.by(() => this.#options().ref)

  constructor(options: () => MenubarRootOptions) {
    this.#options = options

    const { tree, nodeId } = attachFloatingNode<MenuTreeEvents>({
      open: () => this.hasSubmenuOpen
    })
    this.#nodeId = nodeId

    this.composite = new Composite(() => ({
      orientation: this.#options().orientation,
      loopFocus: this.#options().loopFocus,
      enableHomeAndEnd: true,
      highlightItemOnHover: this.hasSubmenuOpen,
      ref: this.#options().ref
    }))

    $effect(() => {
      return tree.events.on('menuopenchange', this.#onMenuOpenChange)
    })
  }

  #onMenuOpenChange = (details: MenuOpenChangeEvent) => {
    if (details.parentNodeId !== this.#nodeId) return
    if (details.open) {
      this.hasSubmenuOpen = true
      return
    }
    if (details.reason === REASONS.siblingOpen || details.reason === REASONS.listNavigation) return
    this.hasSubmenuOpen = false
  }
}
