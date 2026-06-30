<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    orientation = 'horizontal' as 'horizontal' | 'vertical',
    disabled = false,
    name = undefined,
    form = undefined,
    format = undefined,
    locale = undefined,
    minStepsBetweenValues = 0,
    onValueChange = undefined as ((value: Value) => void) | undefined,
    onValueCommitted = undefined as ((value: Value) => void) | undefined,
    thumbAriaDescribedby = undefined,
    thumbAriaLabel = undefined
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
