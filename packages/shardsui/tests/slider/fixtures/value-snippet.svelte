<script lang="ts">
  import { Slider } from '$lib/components/slider'

  let {
    value = [40, 60],
    format
  }: {
    value?: number[]
    format?: Intl.NumberFormatOptions
  } = $props()
</script>

<Slider.Root {value} {format} data-testid="root">
  <Slider.Value data-testid="value">
    {#snippet children(formatted: string[], raw: number[])}
      <span data-testid="formatted">{JSON.stringify(formatted)}</span>
      <span data-testid="raw">{JSON.stringify(raw)}</span>
    {/snippet}
  </Slider.Value>
  <Slider.Control>
    <Slider.Track>
      <Slider.Thumb index={0} />
      <Slider.Thumb index={1} />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
