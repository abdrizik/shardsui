<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import { chain } from '$lib/internal/chain'
  import FocusGuard from '$lib/internal/focus-guard.svelte'
  import {
    enableFocusInside,
    getNextTabbable,
    getPreviousTabbable,
    isOutsideEvent
  } from '$lib/internal/floating/tabbable'
  import { contains } from '$lib/internal/dom'
  import type { PartProps } from '$lib/internal/types'
  import { NavigationMenuPositionerContext, NavigationMenuContext } from './context'

  type Props = PartProps

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    onfocusout,
    children,
    ...rest
  }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()
  const positioner = NavigationMenuPositionerContext.getOr()

  const hasPositioner = positioner != null

  const publishViewport = attachElement<HTMLElement>((el) => (navigationMenu.viewportElement = el))
  const publishViewportTarget = attachElement<HTMLElement>(
    (el) => (navigationMenu.viewportTargetElement = el)
  )

  const renderGuards = $derived(navigationMenu.open || hasPositioner)

  function focusBeforeContent(event: FocusEvent) {
    const reference = navigationMenu.floatingElement
    if (reference && isOutsideEvent(event, reference)) {
      enableFocusInside(reference)
      getNextTabbable(reference)?.focus()
    } else {
      navigationMenu.beforeOutsideElement?.focus()
    }
  }

  function focusAfterContent(event: FocusEvent) {
    const reference = navigationMenu.floatingElement
    if (reference && isOutsideEvent(event, reference)) {
      enableFocusInside(reference)
      getPreviousTabbable(reference)?.focus()
    } else {
      navigationMenu.afterOutsideElement?.focus()
    }
  }

  function inertViewportOnFocusOut(event: FocusEvent) {
    const related = event.relatedTarget as Element | null
    if (related && !contains(ref, related) && related !== navigationMenu.activeTriggerElement) {
      navigationMenu.viewportInert = true
    }
  }
</script>

{#if hasPositioner}
  {@render beforeGuard()}
  {@render viewportRoot()}
  {@render afterGuard()}
{:else}
  {@render viewportRoot()}
{/if}

{#snippet beforeGuard()}
  {#if renderGuards}
    <FocusGuard bind:ref={navigationMenu.beforeInsideElement} onfocus={focusBeforeContent} />
  {/if}
{/snippet}

{#snippet afterGuard()}
  {#if renderGuards}
    <FocusGuard bind:ref={navigationMenu.afterInsideElement} onfocus={focusAfterContent} />
  {/if}
{/snippet}

{#snippet viewportRoot()}
  <svelte:element
    this={as}
    bind:this={ref}
    {@attach publishViewport}
    {id}
    inert={(!hasPositioner && navigationMenu.viewportInert) || undefined}
    onfocusout={chain(onfocusout, inertViewportOnFocusOut)}
    {...rest}
  >
    {#if hasPositioner}
      {@render children?.()}
    {:else}
      {@render beforeGuard()}
      <div {@attach publishViewportTarget}>
        {@render children?.()}
      </div>
      {@render afterGuard()}
    {/if}
  </svelte:element>
{/snippet}
