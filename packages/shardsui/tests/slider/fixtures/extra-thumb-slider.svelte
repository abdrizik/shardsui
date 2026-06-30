<script lang="ts">
  import { Slider } from '$lib/components/slider'

  let {
    value = [10, 20] as number[],
    onValueChange = undefined as ((value: number | number[]) => void) | undefined,
    onValueCommitted = undefined as ((value: number | number[]) => void) | undefined
  } = $props()
</script>

<Slider.Root {value} {onValueChange} {onValueCommitted} data-testid="root">
  <Slider.Control data-testid="control">
    <Slider.Track>
      <Slider.Thumb />
      <Slider.Thumb />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
