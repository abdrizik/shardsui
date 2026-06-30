<script lang="ts">
  import { Slider } from '$lib/components/slider'
  let {
    value = $bindable([40, 60, 80, 95] as number[]),
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenValues = 0,
    thumbCollisionBehavior = 'push' as 'push' | 'swap' | 'none'
  } = $props()
</script>

<Slider.Root
  {value}
  {min}
  {max}
  {step}
  {minStepsBetweenValues}
  {thumbCollisionBehavior}
  data-testid="root"
>
  <Slider.Value data-testid="value" />
  <Slider.Control data-testid="control">
    <Slider.Track>
      <Slider.Indicator />
      {#each value as _, i (i)}
        <Slider.Thumb index={i} data-testid="thumb" />
      {/each}
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
