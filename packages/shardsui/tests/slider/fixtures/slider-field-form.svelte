<script lang="ts">
  import { Slider } from '$lib/components/slider'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import type { FieldValidator } from '$lib/components/field/field.svelte'

  let {
    validate = () => null,
    range = false,
    value
  }: {
    validate?: FieldValidator
    range?: boolean
    value?: number | number[]
  } = $props()

  const resolvedValue = $derived(value ?? (range ? [5, 12] : 99))
</script>

<Form>
  <Field.Root {validate}>
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
  <button type="submit">submit</button>
</Form>
