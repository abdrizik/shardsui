<script lang="ts" generics="Payload = unknown">
  import { untrack } from 'svelte'
  import type { PartProps } from '$lib/internal/types'
  import type { PreviewCardHandle } from './handle.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { hoverReferenceInteraction } from '$lib/internal/floating/hover/reference.svelte'
  import { getInlineRectCoords } from '$lib/internal/floating/inline-rect'
  import { safePolygon } from '$lib/internal/floating/safe-polygon.svelte'
  import { createFocusReference } from '$lib/internal/floating/focus-reference.svelte'
  import { TriggerRegistration } from '$lib/internal/trigger-registration.svelte'
  import { PreviewCardContext, type PreviewCardTriggerState } from './context'
  import { CLOSE_DELAY, OPEN_DELAY, type PreviewCardRoot } from './preview-card.svelte'

  type Props = PartProps<
    [PreviewCardTriggerState],
    'a',
    'onblur' | 'onfocus' | 'onmouseenter' | 'onmouseleave' | 'onmousemove'
  > & {
    delay?: number
    closeDelay?: number
    payload?: Payload
    handle?: PreviewCardHandle<Payload>
  }

  const uid = $props.id()

  let {
    as = 'a',
    ref = $bindable(null),
    id = uid,
    handle,
    delay = OPEN_DELAY,
    closeDelay = CLOSE_DELAY,
    payload,
    onmouseenter,
    onmousemove,
    onmouseleave,
    onfocus,
    onblur,
    children,
    ...rest
  }: Props = $props()

  const previewCard: PreviewCardRoot = untrack(() =>
    handle ? handle.state : PreviewCardContext.get()
  )

  const focus = createFocusReference(() => ({
    open: previewCard.open,
    openChangeReason: previewCard.openChangeReason,
    triggerElement: ref,
    activeTriggerElement: previewCard.triggerElement,
    popupElement: previewCard.popupElement,
    triggerElements: previewCard.triggerElements,
    delay,
    setOpen: previewCard.setOpen
  }))

  const registration = new TriggerRegistration(
    () => ({ id, ref, root: previewCard }),
    () => ({ payload, closeDelay }),
    previewCard.applyTriggerBindings
  )

  const safePolygonGuard = safePolygon()
  hoverReferenceInteraction(previewCard, () => ({
    mouseOnly: true,
    move: false,
    closeGuard: safePolygonGuard,
    delay: { open: delay, close: closeDelay },
    triggerElement: ref,
    isActiveTrigger: registration.isTriggerActive
  }))

  const previewCardState: PreviewCardTriggerState = $derived({ open: registration.isActiveOpen })

  const stateAttrs = $derived(dataAttrs({ 'popup-open': registration.isActiveOpen }))

  function clearInlineRect() {
    previewCard.inlineRectCoords = undefined
  }

  function updateInlineRect(event: MouseEvent) {
    if (!registration.isActiveOpen && ref) {
      previewCard.inlineRectCoords = getInlineRectCoords(ref, event.clientX, event.clientY)
    }
  }
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {id}
  onmouseenter={chain(onmouseenter, updateInlineRect)}
  onmousemove={chain(onmousemove, updateInlineRect)}
  onmouseleave={chain(onmouseleave, focus.reset)}
  onfocus={chain(onfocus, clearInlineRect, focus.onfocus)}
  onblur={chain(onblur, focus.onblur)}
  {...rest}
>
  {@render children?.(previewCardState)}
</svelte:element>
