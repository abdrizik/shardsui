<script module lang="ts">
  // ms of scroll quiet before scrolling counts as programmatic again — long enough to span the
  // gap between a user input event and the momentum scrolling it produces.
  const SCROLL_END_DELAY = 100
</script>

<script lang="ts">
  import { untrack } from 'svelte'
  import type { Attachment } from 'svelte/attachments'
  import type { PartProps } from '$lib/internal/types'
  import { chain } from '$lib/internal/chain'
  import { Timeout } from '$lib/internal/timeout'
  import { ScrollAreaContext } from './context'
  import type { ScrollAreaRootState } from './scroll-area.svelte'

  type Props = PartProps<
    [ScrollAreaRootState],
    'div',
    'onkeydown' | 'onpointerenter' | 'onpointermove' | 'onscroll' | 'onwheel'
  >

  let {
    as = 'div',
    ref = $bindable(null),
    class: classProp,
    style,
    onscroll,
    onwheel,
    onpointermove,
    onpointerenter,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  const scrollArea = ScrollAreaContext.get()

  let isProgrammaticScroll = true
  const scrollEndTimeout = new Timeout()
  $effect(scrollEndTimeout.disposeEffect)
  const waitForAnimationsTimeout = new Timeout()
  $effect(waitForAnimationsTimeout.disposeEffect)

  $effect(() => {
    const _dependencies = [
      scrollArea.viewportElement,
      scrollArea.scrollbarXElement,
      scrollArea.scrollbarYElement,
      scrollArea.thumbXElement,
      scrollArea.thumbYElement,
      scrollArea.cornerElement,
      scrollArea.direction,
      scrollArea.overflowEdgeThreshold
    ]
    untrack(scrollArea.measure)
  })

  const attachViewport: Attachment<HTMLElement> = (node) => {
    scrollArea.viewportElement = node
    // `pointerenter` doesn't fire on mount, so a cursor already resting over the viewport
    // would otherwise go unnoticed until it moves.
    if (node.matches(':hover')) scrollArea.hovering = true
    return () => (scrollArea.viewportElement = null)
  }

  const observeResize: Attachment<HTMLElement> = (node) => {
    const observer = new ResizeObserver(scrollArea.measure)
    observer.observe(node)

    // 0 ms so animations starting alongside this mount are registered before they're read.
    waitForAnimationsTimeout.start(0, () => {
      const animations = node.getAnimations({ subtree: true })
      if (animations.length === 0) return

      Promise.allSettled(animations.map((animation) => animation.finished))
        .then(scrollArea.measure)
        .catch(() => {})
    })

    return () => {
      observer.disconnect()
      waitForAnimationsTimeout.clear()
    }
  }

  function measureOnScroll() {
    const viewport = scrollArea.viewportElement
    if (!viewport) return

    scrollArea.measure()
    if (scrollArea.touchModality || !isProgrammaticScroll) {
      scrollArea.markScrolled({ x: viewport.scrollLeft, y: viewport.scrollTop })
    }

    scrollEndTimeout.start(SCROLL_END_DELAY, () => {
      isProgrammaticScroll = true
    })
  }

  function markUserScroll() {
    isProgrammaticScroll = false
  }

  const tabIndex = $derived(scrollArea.hiddenScrollbars.x && scrollArea.hiddenScrollbars.y ? -1 : 0)
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...scrollArea.stateAttrs}
  {@attach attachViewport}
  {@attach observeResize}
  class={[classProp, 'hide-scrollbar']}
  role="presentation"
  tabindex={tabIndex}
  {style}
  style:overflow="scroll"
  onscroll={chain(onscroll, measureOnScroll)}
  onwheel={chain(onwheel, markUserScroll)}
  onpointermove={chain(onpointermove, markUserScroll)}
  onpointerenter={chain(onpointerenter, markUserScroll)}
  onkeydown={chain(onkeydown, markUserScroll)}
  {...rest}
>
  {@render children?.(scrollArea.state)}
</svelte:element>

<style>
  .hide-scrollbar {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
</style>
