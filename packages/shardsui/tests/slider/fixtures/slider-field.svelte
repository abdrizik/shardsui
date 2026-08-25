<script lang="ts">
  import { Slider } from '$lib/components/slider'
  import { Field } from '$lib/components/field'
  import type { FieldValidator } from '$lib/components/field/field.svelte'
  import type { FormValidationMode } from '$lib/components/form'

  let {
    validate = () => null,
    validationMode,
    range = false,
    value
  }: {
    validate?: FieldValidator
    validationMode?: FormValidationMode
    range?: boolean
    value?: number | number[]
  } = $props()

  const resolvedValue = $derived(value ?? (range ? [0, 5] : 0))
</script>

<Field.Root {validate} {validationMode}>
  <Slider.Root value={resolvedValue} data-testid="root">
    <Slider.Control data-testid="control">
      <Slider.Track>
        {#if range}
          <Slider.Thumb index={0} data-testid="thumb" />
          <Slider.Thumb index={1} data-testid="thumb-1" />
        {:else}
          <Slider.Thumb data-testid="thumb" />
        {/if}
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
  <Field.Error data-testid="error" />
</Field.Root>
