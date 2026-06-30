<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable([20, 50] as number[]),
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    minStepsBetweenValues = 0,
    thumbCollisionBehavior = 'push' as 'push' | 'swap' | 'none',
    onValueChange = undefined as ((value: Value) => void) | undefined,
    onValueCommitted = undefined as ((value: Value) => void) | undefined,
    disabled = false,
    orientation = 'horizontal' as 'horizontal' | 'vertical',
    name = undefined,
    format = undefined,
    locale = undefined
  } = $props()
</script>

<Slider.Root
  {value}
  {min}
  {max}
  {step}
  {largeStep}
  {minStepsBetweenValues}
  {thumbCollisionBehavior}
  {onValueChange}
  {onValueCommitted}
  {disabled}
  {orientation}
  {name}
  {format}
  {locale}
  data-testid="root"
>
  <Slider.Value data-testid="value" />
  <Slider.Control data-testid="control">
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb index={0} data-testid="thumb" />
      <Slider.Thumb index={1} data-testid="thumb" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
