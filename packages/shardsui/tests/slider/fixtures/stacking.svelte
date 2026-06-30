<script lang="ts">
  import { Slider } from '$lib/components/slider'

  let {
    value = [20, 20] as number[],
    onfocus = undefined,
    onblur = undefined
  }: {
    value?: number[]
    onfocus?: (event: FocusEvent) => void
    onblur?: (event: FocusEvent) => void
  } = $props()
</script>

<Slider.Root {value} data-testid="root">
  <Slider.Control>
    <Slider.Track>
      <Slider.Thumb index={0} data-testid="thumb-0" {onfocus} {onblur} />
      <Slider.Thumb index={1} data-testid="thumb-1" {onfocus} {onblur} />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
