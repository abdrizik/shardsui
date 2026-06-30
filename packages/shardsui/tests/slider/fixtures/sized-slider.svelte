<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable(50 as Value),
    width = 1000,
    nextValue = undefined as Value | undefined
  } = $props()

  const values = $derived(Array.isArray(value) ? value : [value])
</script>

{#if nextValue !== undefined}
  <button type="button" onclick={() => (value = nextValue)}>set</button>
{/if}

<Slider.Root bind:value style="width: {width}px" data-testid="root">
  <Slider.Control data-testid="control">
    <Slider.Track>
      <Slider.Indicator />
      {#each values as _, index (index)}
        <Slider.Thumb index={values.length > 1 ? index : undefined} data-testid="thumb" />
      {/each}
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
