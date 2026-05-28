<script lang="ts" generics="Instant extends string">
  import { popupAutoResize } from '$lib/internal/popup-auto-resize.svelte'
  import { PopupViewport } from '$lib/internal/popup-viewport.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { AnchoredViewportState } from '$lib/internal/anchored-state'
  import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'
  import type { PartProps } from '$lib/internal/types'

  type Props = PartProps<[AnchoredViewportState<Instant>]> & {
    activeTrigger: Element | null
    activeTriggerId?: string | null
    payload?: unknown
    popupElement: HTMLElement | null
    positionerElement: HTMLElement | null
    side: Side
    direction: 'ltr' | 'rtl'
    mounted: boolean
    open: boolean
    instantType: Instant | undefined
    hasViewport?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    activeTrigger,
    activeTriggerId = null,
    payload,
    popupElement,
    positionerElement,
    side,
    direction,
    mounted,
    open,
    instantType,
    hasViewport = $bindable(false),
    children,
    ...rest
  }: Props = $props()

  let currentContainerElement = $state<HTMLElement | null>(null)
  let previousContainerElement = $state<HTMLElement | null>(null)

  const resizeContent = $derived([payload, currentContainerElement])

  const viewport = new PopupViewport(() => ({
    activeTrigger,
    activeTriggerId,
    currentContainer: currentContainerElement,
    open,
    mounted
  }))

  $effect(() => {
    hasViewport = true
    return () => {
      hasViewport = false
    }
  })

  $effect(() => {
    const node = viewport.previousNode
    const container = previousContainerElement
    if (!container || !node) return
    container.replaceChildren(...Array.from(node.childNodes))
  })

  popupAutoResize(() => ({
    popupElement,
    positionerElement,
    content: resizeContent,
    side,
    direction,
    mounted,
    onMeasureLayout: () => {
      if (currentContainerElement) {
        currentContainerElement.style.setProperty('animation', 'none')
        currentContainerElement.style.setProperty('transition', 'none')
      }
      if (previousContainerElement) {
        previousContainerElement.style.setProperty('display', 'none')
      }
    },
    onMeasureLayoutComplete: (prevDim) => {
      if (currentContainerElement) {
        currentContainerElement.style.removeProperty('animation')
        currentContainerElement.style.removeProperty('transition')
      }
      if (previousContainerElement) {
        previousContainerElement.style.removeProperty('display')
      }
      if (prevDim) {
        viewport.previousContentDimensions = prevDim
      }
    }
  }))

  const previousWidth = $derived(
    viewport.previousContentDimensions ? `${viewport.previousContentDimensions.width}px` : undefined
  )

  const previousHeight = $derived(
    viewport.previousContentDimensions
      ? `${viewport.previousContentDimensions.height}px`
      : undefined
  )

  const viewportState: AnchoredViewportState<Instant> = $derived({
    activationDirection: viewport.activationDirection,
    transitioning: viewport.transitioning,
    instant: instantType
  })

  const stateAttrs = $derived(
    dataAttrs({
      'activation-direction': viewport.activationDirection,
      transitioning: viewport.transitioning,
      instant: instantType
    })
  )
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} {style} {...rest}>
  {#if viewport.transitioning}
    <div
      bind:this={previousContainerElement}
      data-previous
      style:--popup-width={previousWidth}
      style:--popup-height={previousHeight}
      style:position="absolute"
      inert
      {...dataAttrs({ 'ending-style': !viewport.showStartingStyle })}
    ></div>
  {/if}
  {#key viewport.contentKey}
    <div
      bind:this={currentContainerElement}
      data-current
      style:transition={viewport.showStartingStyle ? 'none' : null}
      {...dataAttrs({
        'starting-style': viewport.transitioning && viewport.showStartingStyle
      })}
    >
      {@render children?.(viewportState)}
    </div>
  {/key}
</svelte:element>
