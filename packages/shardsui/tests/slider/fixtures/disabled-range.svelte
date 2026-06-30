<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable([20, 80] as number[]),
    thumbCollisionBehavior = 'push' as 'push' | 'swap' | 'none',
    onValueChange = undefined as ((value: Value) => void) | undefined
  } = $props()
</script>

<Slider.Root {value} {thumbCollisionBehavior} {onValueChange} data-testid="root">
  <Slider.Control data-testid="control">
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb index={0} data-testid="thumb-0" />
      <Slider.Thumb index={1} disabled data-testid="thumb-1" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
