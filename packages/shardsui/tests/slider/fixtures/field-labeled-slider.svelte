<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Slider } from '$lib/components/slider'

  let { value = 50, showThumb = true }: { value?: number; showThumb?: boolean } = $props()
</script>

<Field.Root>
  <Slider.Root {value} data-testid="root">
    <Slider.Label data-testid="label">Volume</Slider.Label>
    <Slider.Control data-testid="control">
      {#if showThumb}
        <input aria-label="Unrelated range" type="range" />
        <Slider.Thumb data-testid="thumb" />
      {/if}
    </Slider.Control>
  </Slider.Root>
</Field.Root>
