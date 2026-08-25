<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field, type FieldValidator } from '$lib/components/field'

  let {
    validate,
    validationMode = 'onChange',
    onsubmit
  }: {
    validate?: FieldValidator
    validationMode?: 'onChange' | 'onBlur'
    onsubmit?: (event: SubmitEvent) => void
  } = $props()
</script>

<Form errors={{ name: 'server error' }} {onsubmit}>
  <Field.Root name="name" invalid {validate} {validationMode}>
    <Field.Control data-testid="name" />
    <Field.Error data-testid="name-error" />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
