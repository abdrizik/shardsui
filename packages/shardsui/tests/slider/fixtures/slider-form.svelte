<script lang="ts">
  import { Slider } from '$lib/components/slider'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import type { FormErrors } from '$lib/components/form/form.svelte'

  let {
    errors = { test: 'test' } as FormErrors,
    value = 50
  }: {
    errors?: FormErrors
    value?: number
  } = $props()
</script>

<Form {errors}>
  <Field.Root name="test" data-testid="field">
    <Slider.Root {value} data-testid="slider">
      <Slider.Value data-testid="value" />
      <Slider.Control data-testid="control">
        <Slider.Track>
          <Slider.Indicator />
          <Slider.Thumb data-testid="thumb" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
    <Field.Error data-testid="error" />
  </Field.Root>
</Form>
