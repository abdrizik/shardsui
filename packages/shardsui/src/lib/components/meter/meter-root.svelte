<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { visuallyHidden } from '$lib/internal/visually-hidden'
  import { MeterContext } from './context'
  import { MeterRoot } from './meter.svelte'

  type Props = PartProps & {
    value: number
    min?: number
    max?: number
    format?: Intl.NumberFormatOptions
    locale?: Intl.LocalesArgument
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value,
    min = 0,
    max = 100,
    format,
    locale,
    children,
    ...rest
  }: Props = $props()

  const meter = new MeterRoot(() => ({ value, min, max, format, locale }))

  MeterContext.set(meter)
</script>

<svelte:element
  this={as}
  bind:this={ref}
  role="meter"
  aria-valuenow={meter.clampedValue}
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuetext={meter.formattedValue}
  aria-labelledby={meter.labelId}
  {...rest}
>
  {@render children?.()}
  <!-- force NVDA to read the label -->
  <span role="presentation" style={visuallyHidden}>x</span>
</svelte:element>
