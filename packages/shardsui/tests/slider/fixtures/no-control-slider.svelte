<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Slider } from '$lib/components/slider'

  let { onFormSubmit }: { onFormSubmit?: (values: Record<string, unknown>) => void } = $props()
</script>

<Form {onFormSubmit}>
  <Field.Root name="slider">
    <Slider.Root value={30} data-testid="root">
      <Slider.Thumb data-testid="thumb" />
    </Slider.Root>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
