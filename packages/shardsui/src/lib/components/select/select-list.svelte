<script lang="ts">
  import type { Attachment } from 'svelte/attachments'
  import { attachElement } from '$lib/internal/attach-element'
  import type { PartProps } from '$lib/internal/types'
  import { on } from 'svelte/events'
  import { SelectContext } from './context'

  type Props = PartProps

  let {
    as = 'div',
    ref = $bindable(null),
    class: classProp,
    id: idProp,
    children,
    ...rest
  }: Props = $props()

  const select = SelectContext.get()

  const id = $derived(idProp ?? `${select.rootId}-list`)

  function registerListId() {
    select.listId = id
    return () => {
      select.listId = undefined
    }
  }

  const trackScroll: Attachment<HTMLElement> = (node) =>
    on(node, 'scroll', () => {
      if (!select.positionerElement || !select.popupElement || !select.open) return
      select.updateScrollArrowVisibility()
    })

  const hideScrollbar = $derived(select.hasScrollArrows && select.openMethod !== 'touch')
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {@attach attachElement((el) => (select.listElement = el))}
  {@attach trackScroll}
  {@attach registerListId}
  class={[classProp, hideScrollbar && 'hide-scrollbar']}
  {id}
  role="listbox"
  aria-multiselectable={select.multiple || undefined}
  {...rest}
>
  {@render children?.()}
</svelte:element>

<style>
  .hide-scrollbar {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
</style>
