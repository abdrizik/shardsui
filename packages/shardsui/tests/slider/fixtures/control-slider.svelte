<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable(50 as Value),
    min = 0,
    max = 100,
    orientation = 'horizontal' as 'horizontal' | 'vertical',
    thumbAlignment = 'center' as 'center' | 'edge',
    thumbCollisionBehavior = 'push' as 'push' | 'swap' | 'none',
    minStepsBetweenValues = 0,
    thumbCount = undefined as number | undefined,
    trackText = false,
    nextValue = undefined as Value | undefined,
    writeBack = false,
    onValueChange = undefined as ((value: Value) => void) | undefined,
    onValueCommitted = undefined as ((value: Value) => void) | undefined
  } = $props()

  const values = $derived(Array.isArray(value) ? value : [value])
  const thumbs = $derived(thumbCount ?? values.length)
</script>

{#if nextValue !== undefined}
  <button type="button" onclick={() => (value = nextValue)}>set</button>
{/if}

<Slider.Root
  {value}
  {min}
  {max}
  {orientation}
  {thumbAlignment}
  {thumbCollisionBehavior}
  {minStepsBetweenValues}
  onValueChange={(next) => {
    onValueChange?.(next)
    if (writeBack) value = next
  }}
  {onValueCommitted}
  data-testid="root"
>
  <Slider.Control data-testid="control">
    {#if trackText}
      <span data-testid="track-text">Track</span>
    {/if}
    {#each { length: thumbs } as _, index (index)}
      <Slider.Thumb index={values.length > 1 ? index : undefined} data-testid="thumb-{index}" />
    {/each}
  </Slider.Control>
</Slider.Root>
