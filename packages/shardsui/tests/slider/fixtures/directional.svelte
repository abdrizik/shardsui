<script lang="ts">
  import { Slider } from '$lib/components/slider'
  import { DirectionProvider, type TextDirection } from '$lib/components/direction-provider'

  type Value = number | number[]

  let {
    direction = 'ltr' as TextDirection,
    orientation = 'horizontal' as 'horizontal' | 'vertical',
    value = 20 as Value,
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    onValueChange = undefined as ((value: Value) => void) | undefined
  } = $props()

  const values = $derived(Array.isArray(value) ? value : [value])
</script>

<div dir={direction}>
  <DirectionProvider {direction}>
    <Slider.Root
      {value}
      {min}
      {max}
      {step}
      {largeStep}
      {orientation}
      {onValueChange}
      data-testid="root"
    >
      <Slider.Control data-testid="control">
        <Slider.Track>
          <Slider.Indicator />
          {#each values as _, index (index)}
            <Slider.Thumb index={values.length > 1 ? index : undefined} data-testid="thumb" />
          {/each}
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  </DirectionProvider>
</div>
