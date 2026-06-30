<script lang="ts">
  import { Slider } from '$lib/components/slider'

  let {
    value = 50,
    onkeydown = undefined as ((event: KeyboardEvent) => void) | undefined
  }: {
    value?: number
    onkeydown?: (event: KeyboardEvent) => void
  } = $props()
</script>

<Slider.Root {value} data-testid="root">
  <Slider.Control>
    <Slider.Track>
      <Slider.Thumb data-testid="thumb" {onkeydown} />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
