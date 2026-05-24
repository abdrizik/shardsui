<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { visuallyHidden } from '$lib/internal/visually-hidden'
  import { ProgressContext } from './context'
  import { ProgressRoot, type ProgressState } from './progress.svelte'

  type Props = PartProps<[ProgressState]> & {
    value: number | null
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

  const progress = new ProgressRoot(() => ({ value, min, max, format, locale }))

  ProgressContext.set(progress)

  const ariaValueText = $derived(
    progress.status === 'indeterminate' ? 'indeterminate progress' : progress.formattedValue
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...progress.stateAttrs}
  role="progressbar"
  aria-valuenow={progress.clampedValue ?? undefined}
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuetext={ariaValueText}
  aria-labelledby={progress.labelId}
  {...rest}
>
  {@render children?.(progress.state)}
  <!-- force NVDA to read the label -->
  <span role="presentation" style={visuallyHidden}>x</span>
</svelte:element>
