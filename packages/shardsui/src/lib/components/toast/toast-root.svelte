<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import { contains, getTarget } from '$lib/internal/dom'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { untrack } from 'svelte'
  import type { Attachment } from 'svelte/attachments'
  import { on } from 'svelte/events'
  import { ToastProviderContext, ToastContext, type ToastRootState } from './context'
  import { ToastSwipe } from './swipe.svelte'
  import { ToastRoot } from './toast.svelte'
  import type { SwipeDirection } from '$lib/internal/swipe-dismiss.svelte'
  import type { ToastObject } from './types'

  type Props = PartProps<[ToastRootState]> & {
    toast: ToastObject
    swipeDirection?: 'up' | 'down' | 'left' | 'right' | ('up' | 'down' | 'left' | 'right')[]
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    toast,
    swipeDirection = ['down', 'right'],
    onpointerdown,
    onpointermove,
    onpointerup,
    onpointercancel,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  const provider = ToastProviderContext.get()

  const toastRoot = new ToastRoot(() => ({ toast, ref }))
  ToastContext.set(toastRoot)

  const isAnchored = $derived(toast.positionerProps?.anchor !== undefined)

  const swipeDirections = $derived<SwipeDirection[]>(
    isAnchored ? [] : Array.isArray(swipeDirection) ? swipeDirection : [swipeDirection]
  )

  const swipeEnabled = $derived(swipeDirections.length > 0)

  const swipe = new ToastSwipe(() => ({
    directions: swipeDirections,
    element: ref,
    onSwipeStart: () => {
      provider.hovering = true
    },
    onDismiss: () => provider.close(toast.id)
  }))

  let lastToastId: string | undefined

  $effect.pre(() => {
    const id = toast.id
    if (toast.transitionStatus !== 'starting' && lastToastId === id) return
    if (lastToastId !== undefined) swipe.reset()
    lastToastId = id
  })

  function startSwipe(event: PointerEvent) {
    if (!swipeEnabled || event.button !== 0) return
    if (event.pointerType === 'touch') provider.pauseTimers()
    swipe.start(event)
  }

  const toastIndex = $derived(provider.stackIndexOf(toast))
  const toastOffsetY = $derived(provider.offsetYOf(toast.id))

  const isHighPriority = $derived(toast.priority === 'high')

  const toastState: ToastRootState = $derived({
    transitionStatus: toast.transitionStatus,
    expanded: provider.expanded,
    limited: toast.limited ?? false,
    type: toast.type,
    swiping: swipe.swiping,
    swipeDirection: swipe.direction
  })

  const stateAttrs = $derived(
    dataAttrs({
      expanded: provider.expanded,
      limited: toast.limited,
      swiping: swipe.swiping,
      type: toast.type,
      'swipe-direction': swipe.direction,
      'starting-style': toast.transitionStatus === 'starting',
      'ending-style': toast.transitionStatus === 'ending'
    })
  )

  openChangeComplete(() => ({
    enabled: toast.transitionStatus === 'ending',
    open: toast.transitionStatus !== 'ending',
    element: ref,
    onComplete: () => untrack(() => provider.remove(toast.id))
  }))

  const preventTouchMove: Attachment<HTMLElement> = (node) => {
    if (!swipeEnabled) return

    return on(
      node,
      'touchmove',
      (event) => {
        const target = getTarget(event)
        if (!swipe.swiping || !contains(node, target)) return
        event.preventDefault()
      },
      { passive: false }
    )
  }

  $effect(() => {
    if (!swipe.swiping) return
    const doc = ref?.ownerDocument ?? document
    const offUp = on(doc, 'pointerup', swipe.end)
    const offCancel = on(doc, 'pointercancel', swipe.end)
    return () => {
      offUp()
      offCancel()
    }
  })

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (!contains(ref, (ref?.ownerDocument ?? document).activeElement)) return
      provider.close(toast.id)
    }
  }
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach preventTouchMove}
  {style}
  style:--toast-swipe-movement-x={swipe.dragStyles.movementX}
  style:--toast-swipe-movement-y={swipe.dragStyles.movementY}
  style:transition={swipe.dragStyles.transition}
  style:transform={swipe.dragStyles.transform}
  style:--toast-index={toastIndex}
  style:--toast-offset-y={`${toastOffsetY}px`}
  style:--toast-height={toast.height ? `${toast.height}px` : undefined}
  inert={toast.limited}
  role={isHighPriority ? 'alertdialog' : 'dialog'}
  tabindex={0}
  aria-modal={false}
  aria-labelledby={toastRoot.titleId}
  aria-describedby={toastRoot.descriptionId}
  aria-hidden={isHighPriority && !provider.focused ? true : undefined}
  onpointerdown={chain(onpointerdown, startSwipe)}
  onpointermove={chain(onpointermove, swipe.move)}
  onpointerup={chain(onpointerup, swipe.end)}
  onpointercancel={chain(onpointercancel, swipe.end)}
  onkeydown={chain(onkeydown, closeOnEscape)}
  {...rest}
>
  {@render children?.(toastState)}
</svelte:element>
