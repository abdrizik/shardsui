<script
  lang="ts"
  generics="Open extends boolean | undefined = undefined, Instant extends string | undefined = undefined"
>
  import type { Align, Side } from '$lib/internal/floating/anchor-positioning.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { mergeStyle } from '$lib/internal/merge-style'

  type ArrowPositioner = {
    side: Side
    align: Align
    arrowX: number | undefined
    arrowY: number | undefined
    arrowUncentered: boolean
    arrowElement: Element | null
  }

  type ArrowState = {
    open: Open
    side: Side
    align: Align
    uncentered: boolean
    instant: Instant
  }

  type Props = PartProps<[ArrowState]> & {
    positioner: ArrowPositioner
    open?: Open
    instant?: Instant
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    positioner,
    open,
    instant,
    children,
    ...rest
  }: Props = $props()

  const arrowStyle = $derived(
    mergeStyle(
      'position:absolute',
      positioner.arrowX !== undefined && `left:${positioner.arrowX}px`,
      positioner.arrowY !== undefined && `top:${positioner.arrowY}px`,
      style
    )
  )

  const arrowState = $derived({
    open: open as Open,
    side: positioner.side,
    align: positioner.align,
    uncentered: positioner.arrowUncentered,
    instant: instant as Instant
  })

  const stateAttrs = $derived(
    dataAttrs({
      open,
      // A toast arrow passes no `open`, and must not gain a `data-closed` from that absence.
      closed: open !== undefined && !open,
      instant,
      side: positioner.side,
      align: positioner.align,
      uncentered: positioner.arrowUncentered
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  style={arrowStyle}
  aria-hidden="true"
  {@attach attachElement((el) => (positioner.arrowElement = el))}
  {...rest}
>
  {@render children?.(arrowState)}
</svelte:element>
