<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = 25 as Value,
    format = undefined as Intl.NumberFormatOptions | undefined,
    onSubmit = undefined as ((data: FormData) => void) | undefined
  } = $props()

  const values = $derived(Array.isArray(value) ? value : [value])

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    onSubmit?.(new FormData(event.currentTarget as HTMLFormElement))
  }
</script>

<Form {onsubmit}>
  <Field.Root name="slider">
    <Slider.Root {value} {format} data-testid="root">
      <Slider.Control data-testid="control">
        <Slider.Track>
          <Slider.Indicator />
          {#each values as _, index (index)}
            <Slider.Thumb index={values.length > 1 ? index : undefined} data-testid="thumb" />
          {/each}
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
