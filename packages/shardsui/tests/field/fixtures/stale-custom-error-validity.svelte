<script lang="ts">
  import { Field, type FieldValidityState } from '$lib/components/field'
  import { Form, type FormValidationMode } from '$lib/components/form'

  let {
    onValidity,
    validate,
    validationMode
  }: {
    onValidity: (data: FieldValidityState) => void
    validate: () => string
    validationMode: FormValidationMode
  } = $props()
</script>

<Form>
  <Field.Root {validationMode} {validate}>
    <Field.Control required data-testid="control" />
    <Field.Error match="valueMissing">Required</Field.Error>
    <Field.Validity>
      {#snippet children(data)}
        {onValidity(data)}
      {/snippet}
    </Field.Validity>
  </Field.Root>
  <button type="submit">submit</button>
</Form>
