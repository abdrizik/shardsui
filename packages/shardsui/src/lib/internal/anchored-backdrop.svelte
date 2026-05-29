<script lang="ts">
  import type { AnchoredBackdropState } from '$lib/internal/anchored-state'
  import type { PartProps } from '$lib/internal/types'
  import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { mergeStyle } from '$lib/internal/merge-style'

  type BackdropRoot = {
    open: boolean
    mounted: boolean
    transitionStatus: TransitionStatus
  }

  type Props = PartProps<[AnchoredBackdropState]> & {
    root: BackdropRoot
    pointerEventsNone?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    root,
    pointerEventsNone = false,
    children,
    ...rest
  }: Props = $props()

  const mergedStyle = $derived(
    mergeStyle(
      'user-select:none;-webkit-user-select:none',
      pointerEventsNone && 'pointer-events:none',
      style
    )
  )

  const backdropState: AnchoredBackdropState = $derived({
    open: root.open,
    transitionStatus: root.transitionStatus
  })

  const stateAttrs = $derived(
    dataAttrs({
      open: root.open,
      closed: !root.open,
      'starting-style': root.transitionStatus === 'starting',
      'ending-style': root.transitionStatus === 'ending'
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  style={mergedStyle}
  hidden={!root.mounted}
  role="presentation"
  {...rest}
>
  {@render children?.(backdropState)}
</svelte:element>
