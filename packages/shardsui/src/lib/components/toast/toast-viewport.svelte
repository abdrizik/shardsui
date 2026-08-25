<script lang="ts">
  import { getTarget, contains } from '$lib/internal/dom'
  import type { PartProps } from '$lib/internal/types'
  import { ToastProviderContext, type ToastViewportState } from './context'
  import { chain } from '$lib/internal/chain'
  import FocusGuard from '$lib/internal/focus-guard.svelte'
  import { attachElement } from '$lib/internal/attach-element'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { visuallyHidden } from '$lib/internal/visually-hidden'
  import { matchesFocusVisible } from '$lib/internal/floating/element'
  import { Timeout } from '$lib/internal/timeout'
  import { on } from 'svelte/events'

  type Props = PartProps<[ToastViewportState]>

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    onmouseenter,
    onmousemove,
    onmouseleave,
    onfocusin,
    onfocusout,
    onkeydown,
    onclick,
    onpointerdown,
    onpointerup,
    onpointercancel,
    children,
    ...rest
  }: Props = $props()

  const provider = ToastProviderContext.get()

  let handlingFocusGuard = false
  let mouseLeavePending = false
  let touchActive = false

  const windowFocusTimeout = new Timeout()
  $effect(windowFocusTimeout.disposeEffect)

  $effect(() => {
    if (provider.isEmpty || !provider.viewport) return

    const doc = provider.viewport.ownerDocument
    const win = doc.defaultView ?? window

    function focusViewportOnF6(event: KeyboardEvent) {
      if (event.key === 'F6' && getTarget(event) !== provider.viewport) {
        event.preventDefault()
        provider.prevFocusElement = doc.activeElement as HTMLElement | null
        provider.viewport?.focus({ preventScroll: true })
        provider.pauseTimers()
        provider.focused = true
      }
    }

    function pauseOnWindowBlur(event: FocusEvent) {
      if (getTarget(event) !== win) return
      provider.isWindowFocused = false
      provider.pauseTimers()
    }

    function resumeOnWindowFocus(event: FocusEvent) {
      if (event.relatedTarget) return
      const target = getTarget(event)
      const activeEl = doc.activeElement
      if (
        target === win ||
        !contains(provider.viewport, target) ||
        !matchesFocusVisible(activeEl)
      ) {
        provider.resumeTimers()
      }
      // Deferred so the viewport's own `focus` handler, which runs after this capture-phase
      // listener, still sees the window as blurred and leaves the timers paused.
      windowFocusTimeout.start(0, () => {
        provider.isWindowFocused = true
      })
    }

    const cleanups = [
      on(win, 'keydown', focusViewportOnF6),
      on(win, 'blur', pauseOnWindowBlur, { capture: true }),
      on(win, 'focus', resumeOnWindowFocus, { capture: true }),
      on(doc, 'pointerdown', provider.collapseOnOutsideTouch, { capture: true })
    ]
    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  })

  const hasTransitioningToasts = $derived(
    provider.toasts.some((toast) => toast.transitionStatus === 'ending')
  )

  const highPriorityToasts = $derived(provider.toasts.filter((toast) => toast.priority === 'high'))

  const frontmostHeight = $derived(provider.toasts[0]?.height)

  const toastState: ToastViewportState = $derived({ expanded: provider.expanded })

  function resumeTimersIfWindowFocused() {
    if (provider.isWindowFocused) {
      provider.resumeTimers()
    }
  }

  function flushMouseLeave() {
    if (hasTransitioningToasts || touchActive || !mouseLeavePending) return

    resumeTimersIfWindowFocused()
    provider.hovering = false
    mouseLeavePending = false
  }

  $effect(flushMouseLeave)

  function beginHover() {
    provider.pauseTimers()
    provider.hovering = true
    mouseLeavePending = false
  }

  function leaveViewport() {
    mouseLeavePending = true
    flushMouseLeave()
  }

  function markTouchActive(event: PointerEvent) {
    if (event.pointerType === 'touch') touchActive = true
  }

  function clearTouchActive(event: PointerEvent) {
    if (event.pointerType !== 'touch') return
    touchActive = false
    flushMouseLeave()
  }

  function enterViewport() {
    if (handlingFocusGuard) {
      handlingFocusGuard = false
      return
    }
    if (provider.focused) return
    const doc = provider.viewport?.ownerDocument ?? document
    if (matchesFocusVisible(doc.activeElement)) {
      provider.focused = true
      provider.pauseTimers()
    }
  }

  function exitViewport(event: FocusEvent) {
    if (!provider.focused || contains(provider.viewport, event.relatedTarget)) return
    provider.focused = false
    resumeTimersIfWindowFocused()
  }

  function restoreFocusOnShiftTab(event: KeyboardEvent) {
    if (event.key === 'Tab' && event.shiftKey && getTarget(event) === provider.viewport) {
      event.preventDefault()
      provider.restoreFocusToPrevElement()
    }
  }

  function focusFirstToast(event: FocusEvent) {
    handlingFocusGuard = true

    const firstFocusableToast =
      event.relatedTarget === provider.viewport
        ? provider.toasts.find((toast) => toast.transitionStatus !== 'ending' && !toast.limited)
        : undefined

    if (firstFocusableToast) {
      firstFocusableToast.element?.focus()
    } else {
      provider.restoreFocusToPrevElement()
    }
  }

  const stateAttrs = $derived(dataAttrs({ expanded: provider.expanded }))
</script>

{@render focusGuard()}

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (provider.viewport = el))}
  {style}
  style:--toast-frontmost-height={frontmostHeight ? `${frontmostHeight}px` : undefined}
  tabindex={-1}
  role="region"
  aria-live="polite"
  aria-atomic={false}
  aria-relevant="additions text"
  aria-label="Notifications"
  onmouseenter={chain(onmouseenter, beginHover)}
  onmousemove={chain(onmousemove, beginHover)}
  onmouseleave={chain(onmouseleave, leaveViewport)}
  onfocusin={chain(onfocusin, enterViewport)}
  onfocusout={chain(onfocusout, exitViewport)}
  onkeydown={chain(onkeydown, restoreFocusOnShiftTab)}
  onclick={chain(onclick, enterViewport)}
  onpointerdown={chain(onpointerdown, markTouchActive)}
  onpointerup={chain(onpointerup, clearTouchActive)}
  onpointercancel={chain(onpointercancel, clearTouchActive)}
  {...rest}
>
  {@render focusGuard()}
  {@render children?.(toastState)}
  {@render focusGuard()}
</svelte:element>

{#snippet focusGuard()}
  {#if !provider.isEmpty && provider.prevFocusElement}
    <FocusGuard onfocus={focusFirstToast} />
  {/if}
{/snippet}

{#if !provider.focused && highPriorityToasts.length > 0}
  <div style={visuallyHidden}>
    {#each highPriorityToasts as toast (toast.id)}
      <div role="alert" aria-atomic="true">
        <div>{toast.title}</div>
        <div>{toast.description}</div>
      </div>
    {/each}
  </div>
{/if}
