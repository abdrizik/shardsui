<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable([20, 50]),
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    minStepsBetweenValues = 0,
    thumbCollisionBehavior = 'push',
    onValueChange,
    onValueCommitted,
    disabled = false,
    orientation = 'horizontal',
    name,
    format,
    locale
  }: {
    value?: number[]
    min?: number
    max?: number
    step?: number
    largeStep?: number
    minStepsBetweenValues?: number
    thumbCollisionBehavior?: 'push' | 'swap' | 'none'
    onValueChange?: (value: Value) => void
    onValueCommitted?: (value: Value) => void
    disabled?: boolean
    orientation?: 'horizontal' | 'vertical'
    name?: string
    format?: Intl.NumberFormatOptions
    locale?: string
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
