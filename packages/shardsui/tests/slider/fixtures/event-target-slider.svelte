<script lang="ts">
  import { Slider } from '$lib/components/slider'

  let {
    value = 0,
    onValueChange = undefined as ((value: number | number[]) => void) | undefined,
    ontouchstart = undefined as ((event: TouchEvent) => void) | undefined,
    onmousedown = undefined as ((event: MouseEvent) => void) | undefined
  } = $props()
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div {ontouchstart} {onmousedown}>
  <Slider.Root {value} {onValueChange} data-testid="root">
    <Slider.Control data-testid="control">
      <Slider.Track>
        <Slider.Indicator />
        <Slider.Thumb data-testid="thumb" />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
</div>
