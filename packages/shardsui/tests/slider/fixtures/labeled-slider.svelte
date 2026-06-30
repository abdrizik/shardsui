<script lang="ts">
  import { Slider } from '$lib/components/slider'
  let {
    value = $bindable(50 as number | number[]),
    id = undefined,
    label = 'Volume',
    useAriaLabel = false
  }: {
    value?: number | number[]
    id?: string
    label?: string
    useAriaLabel?: boolean
  } = $props()

  const isRange = $derived(Array.isArray(value))
</script>

<Slider.Root {value} {id} data-testid="root">
  <Slider.Label data-testid="label">{label}</Slider.Label>
  <Slider.Control data-testid="control">
    <Slider.Track>
      {#if isRange}
        <Slider.Thumb index={0} aria-label={useAriaLabel ? 'Minimum price' : undefined} />
        <Slider.Thumb index={1} aria-label={useAriaLabel ? 'Maximum price' : undefined} />
      {:else}
        <Slider.Thumb aria-label={useAriaLabel ? 'Minimum price' : undefined} />
      {/if}
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
