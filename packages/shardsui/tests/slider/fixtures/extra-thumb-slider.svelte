<script lang="ts">
  import { Slider } from '$lib/components/slider'

  let {
    value = [10, 20],
    onValueChange,
    onValueCommitted
  }: {
    value?: number[]
    onValueChange?: (value: number[]) => void
    onValueCommitted?: (value: number[]) => void
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
