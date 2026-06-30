<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = 25 as Value,
    min = undefined as number | undefined,
    max = undefined as number | undefined,
    onFormSubmit = undefined as ((values: Record<string, unknown>) => void) | undefined
  } = $props()

  const values = $derived(Array.isArray(value) ? value : [value])
</script>

<Form {onFormSubmit}>
  <Field.Root name="slider">
    <Slider.Root {value} {min} {max} data-testid="root">
      <Slider.Control data-testid="control">
        <Slider.Track>
          {#each values as _, index (index)}
            <Slider.Thumb index={values.length > 1 ? index : undefined} data-testid="thumb" />
          {/each}
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
