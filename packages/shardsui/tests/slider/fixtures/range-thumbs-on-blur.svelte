<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Slider } from '$lib/components/slider'
  import type { FieldValidator } from '$lib/components/field/field.svelte'

  let {
    validate = () => null,
    value = [20, 50],
    showHelp = false
  }: {
    validate?: FieldValidator
    value?: number[]
    showHelp?: boolean
  } = $props()
</script>

<Field.Root validationMode="onBlur" {validate} data-testid="field">
  <Slider.Root {value} data-testid="root">
    <Slider.Control data-testid="control">
      <Slider.Track>
        <Slider.Thumb index={0} data-testid="thumb-0" />
        <Slider.Thumb index={1} data-testid="thumb-1" />
      </Slider.Track>
      {#if showHelp}
        <button type="button">Help</button>
      {/if}
    </Slider.Control>
  </Slider.Root>
</Field.Root>
<button type="button">after</button>
