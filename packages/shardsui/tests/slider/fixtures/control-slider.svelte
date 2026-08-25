<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    orientation = 'horizontal',
    thumbAlignment = 'center',
    thumbCollisionBehavior = 'push',
    minStepsBetweenValues = 0,
    thumbCount,
    trackText = false,
    nextValue,
    writeBack = false,
    onValueChange,
    onValueCommitted
  }: {
    value?: Value
    min?: number
    max?: number
    orientation?: 'horizontal' | 'vertical'
    thumbAlignment?: 'center' | 'edge'
    thumbCollisionBehavior?: 'push' | 'swap' | 'none'
    minStepsBetweenValues?: number
    thumbCount?: number
    trackText?: boolean
    nextValue?: Value
    writeBack?: boolean
    onValueChange?: (value: Value) => void
    onValueCommitted?: (value: Value) => void
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
