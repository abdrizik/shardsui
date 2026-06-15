<script lang="ts" generics="Value extends number | readonly number[] = number | readonly number[]">
  import type { Orientation, PartProps } from '$lib/internal/types'
  import { SliderRoot, type SliderState } from './slider.svelte'
  import { SliderContext } from './context'

  type Props = PartProps<[SliderState]> & {
    value?: Value
    min?: number
    max?: number
    step?: number
    largeStep?: number
    orientation?: Orientation
    disabled?: boolean
    minStepsBetweenValues?: number
    name?: string
    form?: string
    format?: Intl.NumberFormatOptions
    locale?: Intl.LocalesArgument
    thumbCollisionBehavior?: 'push' | 'swap' | 'none'
    thumbAlignment?: 'center' | 'edge'
    onValueChange?: (value: Value) => void
    onValueCommitted?: (value: Value) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    id,
    value = $bindable(),
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    orientation = 'horizontal',
    disabled = false,
    minStepsBetweenValues = 0,
    name,
    form,
    format,
    locale,
    thumbCollisionBehavior = 'push',
    thumbAlignment = 'center',
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    onValueChange,
    onValueCommitted,
    children,
    ...rest
  }: Props = $props()

  const uid = $props.id()

  const slider = new SliderRoot(() => ({
    uid,
    id,
    value: value ?? min,
    setValue: (next) => (value = next as Value),
    min,
    max,
    step,
    largeStep,
    orientation,
    disabled,
    minStepsBetweenValues,
    thumbCollisionBehavior,
    thumbAlignment,
    name,
    form,
    format,
    locale,
    ariaLabelledBy: ariaLabelledBy ?? undefined,
    ariaDescribedBy: ariaDescribedBy ?? undefined,
    onValueChange: onValueChange as ((value: number | readonly number[]) => void) | undefined,
    onValueCommitted: onValueCommitted as ((value: number | readonly number[]) => void) | undefined,
    ref
  }))

  SliderContext.set(slider)
</script>

<!-- svelte-ignore a11y_role_supports_aria_props -->
<svelte:element
  this={as}
  bind:this={ref}
  {...slider.stateAttrs}
  id={slider.id}
  role="group"
  aria-labelledby={slider.ariaLabelledBy}
  aria-describedby={slider.ariaDescribedBy}
  aria-invalid={slider.ariaInvalid}
  {...rest}
>
  {@render children?.(slider.state)}
</svelte:element>
