<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { valueToPercent } from '$lib/internal/value-to-percent'
  import { mergeStyle } from '$lib/internal/merge-style'
  import type { SliderState } from './slider.svelte'
  import { SliderContext } from './context'

  type Props = PartProps<[SliderState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const slider = SliderContext.get()

  const vertical = $derived(slider.orientation === 'vertical')

  const indicatorStyle = $derived.by(() => {
    const startEdge = vertical ? 'bottom' : 'inset-inline-start'
    const mainSide = vertical ? 'height' : 'width'
    const crossSide = vertical ? 'width' : 'height'
    let styles = `position: ${vertical ? 'absolute' : 'relative'}; ${crossSide}: inherit;`

    if (slider.inset) {
      const start = slider.indicatorStart
      const end = slider.indicatorEnd

      if (start === undefined || (slider.range && end === undefined)) {
        styles += ' visibility: hidden;'
      }

      styles += ` --start-position: ${start ?? 0}%;`

      if (!slider.range) {
        styles += ` ${startEdge}: 0; ${mainSide}: var(--start-position);`
      } else {
        styles += ` --relative-size: ${(end ?? 0) - (start ?? 0)}%;`
        styles += ` ${startEdge}: var(--start-position); ${mainSide}: var(--relative-size);`
      }
    } else {
      const start = valueToPercent(slider.values[0], slider.min, slider.max)
      const end = valueToPercent(slider.values[slider.values.length - 1], slider.min, slider.max)

      if (!slider.range) {
        styles += ` ${startEdge}: 0; ${mainSide}: ${start}%;`
      } else {
        styles += ` ${startEdge}: ${start}%; ${mainSide}: ${end - start}%;`
      }
    }

    return mergeStyle(styles, style)
  })
</script>

<svelte:element this={as} bind:this={ref} {...slider.stateAttrs} style={indicatorStyle} {...rest}>
  {@render children?.(slider.state)}
</svelte:element>
