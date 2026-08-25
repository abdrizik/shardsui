<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    orientation = 'horizontal',
    disabled = false,
    name,
    form,
    format,
    locale,
    minStepsBetweenValues = 0,
    onValueChange,
    onValueCommitted,
    thumbAriaDescribedby,
    thumbAriaLabel
  }: {
    value?: Value
    min?: number
    max?: number
    step?: number
    largeStep?: number
    orientation?: 'horizontal' | 'vertical'
    disabled?: boolean
    name?: string
    form?: string
    format?: Intl.NumberFormatOptions
    locale?: string
    minStepsBetweenValues?: number
    onValueChange?: (value: Value) => void
    onValueCommitted?: (value: Value) => void
    thumbAriaDescribedby?: string
    thumbAriaLabel?: string
  } = $props()
</script>

<Slider.Root
  {value}
  {min}
  {max}
  {step}
  {largeStep}
  {orientation}
  {disabled}
  {name}
  {form}
  {format}
  {locale}
  {minStepsBetweenValues}
  {onValueChange}
  {onValueCommitted}
  data-testid="root"
>
  <Slider.Value data-testid="value" />
  <Slider.Control data-testid="control">
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb
        data-testid="thumb"
        aria-describedby={thumbAriaDescribedby}
        aria-label={thumbAriaLabel}
      />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
