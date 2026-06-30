<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let { value = 20, onValueChange = undefined as ((value: Value) => void) | undefined } = $props()
</script>

<Slider.Root {value} {onValueChange} data-testid="root">
  <Slider.Control data-testid="control">
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb disabled data-testid="thumb" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
