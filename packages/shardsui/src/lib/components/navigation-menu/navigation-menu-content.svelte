<script lang="ts">
  import {
    cancelAnimationFrameTick,
    requestAnimationFrameTick
  } from '$lib/internal/animation-frame.svelte'
  import { createAnimationsFinished } from '$lib/internal/animations-finished.svelte'
  import { chain } from '$lib/internal/chain'
  import { FOCUS_GUARD_ATTRIBUTE } from '$lib/internal/constants'
  import { contains, getTarget } from '$lib/internal/dom'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { Composite } from '$lib/internal/floating/composite.svelte'
  import { portalTo } from '$lib/internal/floating/portal'
  import { mergeStyle } from '$lib/internal/merge-style'
  import type { PartProps } from '$lib/internal/types'
  import {
    NavigationMenuItemContext,
    NavigationMenuCompositeContext,
    NavigationMenuContext,
    type NavigationMenuContentState
  } from './context'
  import type { ContentStatus } from './navigation-menu.svelte'

  type Props = PartProps<
    [NavigationMenuContentState],
    'div',
    'onfocusin' | 'onfocusout' | 'onkeydown'
  > & {
    keepMounted?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    keepMounted = false,
    onkeydown,
    onfocusin,
    onfocusout,
    children,
    ...rest
  }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()
  const item = NavigationMenuItemContext.get()

  const composite = new Composite(() => ({ orientation: 'both', loopFocus: true, ref }))

  NavigationMenuCompositeContext.set(composite)

  const animationsFinished = createAnimationsFinished(() => ({ element: ref }))

  let hasMountedInPortal = $state(false)
  let status = $state<ContentStatus | null>(null)
  let focusInside = $state(false)

  const portalContainer = $derived(
    navigationMenu.viewportTargetElement ?? navigationMenu.viewportElement
  )
  const isActive = $derived(item.value === navigationMenu.value)
  const ending = $derived(status === 'ending')

  $effect(() => {
    if (keepMounted && portalContainer != null) hasMountedInPortal = true
  })

  const renderInline = $derived(keepMounted && portalContainer == null && !hasMountedInPortal)

  $effect(() => {
    if (isActive) {
      if (status === null) status = 'starting'
      else if (status === 'ending') status = 'idle'
    } else if (status !== null && status !== 'ending') {
      status = 'ending'
    }
  })

  $effect(() => {
    if (status !== 'starting') return
    const frameId = requestAnimationFrameTick(() => {
      if (status === 'starting') status = 'idle'
    })
    return () => cancelAnimationFrameTick(frameId)
  })

  $effect(() => {
    if (!ending) return
    const controller = new AbortController()
    animationsFinished.run(() => {
      status = null
    }, controller.signal)
    return () => controller.abort()
  })

  $effect(() => {
    if (isActive && status !== null && ref) navigationMenu.currentContentElement = ref
  })

  const renderPortaled = $derived(portalContainer != null && status !== null)
  const renderHidden = $derived(portalContainer != null && status === null && keepMounted)

  function trackFocusInside(event: FocusEvent) {
    const target = getTarget(event) as Element | null
    if (target?.hasAttribute(FOCUS_GUARD_ATTRIBUTE)) return
    focusInside = true
  }

  function releaseFocusInside(event: FocusEvent) {
    if (!contains(ref, event.relatedTarget as Node | null)) focusInside = false
  }

  const mergedStyle = $derived(
    mergeStyle(ending ? 'position:absolute;top:0;left:0;' : undefined, style)
  )

  const navigationMenuState: NavigationMenuContentState = $derived({
    open: !ending && status !== null,
    transitionStatus: status ?? undefined,
    activationDirection: navigationMenu.activationDirection
  })

  const stateAttrs = $derived(
    dataAttrs({
      open: !ending && status !== null,
      closed: ending || status === null,
      'starting-style': status === 'starting',
      'ending-style': ending,
      'activation-direction': navigationMenu.activationDirection
    })
  )
</script>

{#if renderInline}
  <svelte:element
    this={as}
    bind:this={ref}
    {...stateAttrs}
    hidden
    {style}
    onkeydown={chain(onkeydown, composite.onkeydown)}
    onfocusin={chain(onfocusin)}
    onfocusout={chain(onfocusout)}
    {...rest}
  >
    {@render children?.(navigationMenuState)}
  </svelte:element>
{:else if renderPortaled}
  <svelte:element
    this={as}
    bind:this={ref}
    {...stateAttrs}
    {@attach portalTo(portalContainer)}
    style={mergedStyle}
    inert={(ending && !focusInside) || undefined}
    onkeydown={chain(onkeydown, composite.onkeydown)}
    onfocusin={chain(onfocusin, trackFocusInside)}
    onfocusout={chain(onfocusout, releaseFocusInside)}
    {...rest}
  >
    {@render children?.(navigationMenuState)}
  </svelte:element>
{:else if renderHidden}
  <svelte:element
    this={as}
    bind:this={ref}
    {...stateAttrs}
    {@attach portalTo(portalContainer)}
    hidden
    {style}
    onkeydown={chain(onkeydown)}
    onfocusin={chain(onfocusin)}
    onfocusout={chain(onfocusout)}
    {...rest}
  >
    {@render children?.(navigationMenuState)}
  </svelte:element>
{/if}
