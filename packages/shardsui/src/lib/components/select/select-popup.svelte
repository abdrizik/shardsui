<script lang="ts">
  import type { Attachment } from 'svelte/attachments'
  import { on } from 'svelte/events'
  import { attachElement } from '$lib/internal/attach-element'
  import { chain } from '$lib/internal/chain'
  import { isStationaryWebKitPointer } from '$lib/internal/stationary-pointer'
  import type { PartProps } from '$lib/internal/types'
  import { SelectPositionerContext, SelectContext, type SelectPopupState } from './context'
  import { getDisabledMountTransitionStyles } from '$lib/internal/get-disabled-mount-transition-styles'
  import { ToolbarContext } from '$lib/components/toolbar/context'
  import { COMPOSITE_KEYS } from '$lib/internal/composite'
  import { AnimationFrame } from '$lib/internal/animation-frame.svelte'
  import { manageFocus, type FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { createTypeahead } from '$lib/internal/floating/typeahead.svelte'
  import { anchoredPopupAttrs } from '$lib/internal/anchored-state'
  import { REASONS } from '$lib/internal/reasons'
  import { mergeStyle } from '$lib/internal/merge-style'

  type Props = PartProps<
    [SelectPopupState],
    'div',
    'onfocusout' | 'onkeydown' | 'onpointermove'
  > & {
    finalFocus?: FocusTarget
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    id: idProp,
    finalFocus,
    onkeydown,
    onscroll,
    onfocusout,
    onpointermove,
    children,
    ...rest
  }: Props = $props()

  const select = SelectContext.get()
  const registry = select.itemRegistry
  const insideToolbar = ToolbarContext.getOr() != null

  const positioner = SelectPositionerContext.get()

  const hasList = $derived(select.listElement !== null)
  const id = $derived(idProp ?? (hasList ? undefined : `${select.rootId}-list`))

  function registerPopupId() {
    select.popupId = id
    return () => {
      select.popupId = undefined
    }
  }

  openChangeComplete(() => ({
    open: select.open,
    element: ref,
    onComplete: () => {
      if (select.open) select.onOpenChangeComplete?.(true)
    }
  }))

  manageFocus(() => ({
    open: select.open,
    modal: false,
    enabled: select.mounted,
    popupElement: ref,
    triggerElement: select.triggerElement,
    openMethod: select.openMethod,
    initialFocus: false,
    finalFocus,
    restoreFocus: 'popup',
    closeOnFocusOut: true,
    onFocusOut: (event) => {
      select.setOpen(false, REASONS.focusOut, event)
    },
    closeEvent: select.lastCloseEvent,
    closeReason: select.openChangeReason,
    getNextFocusableElement: () => select.triggerFocusTargetElement
  }))

  const listNavigationFrame = new AnimationFrame()
  $effect(listNavigationFrame.disposeEffect)

  $effect(() => {
    const index = registry.highlightedIndex
    const container = ref
    if (!select.open || !container) return
    const scroll = !select.isPointerModality
    listNavigationFrame.request(() => {
      if (!select.open) return
      if (index >= 0) {
        registry.focusItemElement(index, scroll)
      } else {
        container.focus({ preventScroll: true })
      }
    })
  })

  function indexForNavigationKey(key: string): number | null {
    const active = registry.highlightedIndex
    switch (key) {
      case 'ArrowDown':
        return registry.stepIndex(active, 1)
      case 'ArrowUp':
        return registry.stepIndex(active < 0 ? registry.count : active, -1)
      case 'Home':
        return registry.firstIndex()
      case 'End':
        return registry.lastIndex()
      default:
        return null
    }
  }

  const scrollArrowFrame = new AnimationFrame()
  $effect(scrollArrowFrame.disposeEffect)

  $effect(() => {
    if (select.open && ref) {
      scrollArrowFrame.request(() => select.updateScrollArrowVisibility())
    } else {
      scrollArrowFrame.cancel()
    }
  })

  const typeahead = createTypeahead(() => ({
    enabled: !select.disabled && !select.readOnly,
    items: registry.labels(),
    activeIndex: registry.highlightedIndex,
    referenceElement: select.triggerElement,
    floatingElement: select.positionerElement,
    isIndexDisabled: (index) => registry.isItemDisabled(index),
    onMatch: (index) => (registry.highlightedIndex = index),
    onTyping: (isTyping) => {
      select.typing = isTyping
    }
  }))

  const selectState = $derived({
    open: select.open,
    transitionStatus: select.transitionStatus,
    side: positioner.side,
    align: positioner.align
  })

  function markPointerModality(event: PointerEvent) {
    if (isStationaryWebKitPointer(event)) return
    select.isPointerModality = true
  }

  const stateAttrs = $derived(anchoredPopupAttrs(selectState))

  function navigateItems(event: KeyboardEvent) {
    if (insideToolbar && COMPOSITE_KEYS.has(event.key)) {
      event.stopPropagation()
    }
    if (select.disabled || select.readOnly) {
      return
    }
    select.isPointerModality = false

    const next = indexForNavigationKey(event.key)
    if (next === null) {
      typeahead.matchKey(event)
      return
    }
    event.preventDefault()
    if (next !== -1) registry.highlightedIndex = next
  }

  const trackScroll: Attachment<HTMLElement> = (node) =>
    on(node, 'scroll', () => {
      if (select.listElement) return
      select.updateScrollArrowVisibility()
    })
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (select.popupElement = el))}
  {@attach trackScroll}
  {@attach registerPopupId}
  {id}
  style={mergeStyle(getDisabledMountTransitionStyles(select.transitionStatus), style)}
  role={hasList ? 'presentation' : 'listbox'}
  tabindex={-1}
  data-shards-ui-focusable=""
  aria-multiselectable={(!hasList && select.multiple) || undefined}
  aria-orientation={hasList ? undefined : 'vertical'}
  onkeydown={chain(onkeydown, navigateItems)}
  {onscroll}
  onfocusout={chain(onfocusout, typeahead.resetOnFocusLeave)}
  onpointermove={chain(onpointermove, markPointerModality)}
  {...rest}
>
  {@render children?.(selectState)}
</svelte:element>
