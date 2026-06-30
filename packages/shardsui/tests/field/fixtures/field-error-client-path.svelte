<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form errors={{ username: 'Username is reserved' }}>
  <Field.Root name="username" validate={() => 'Client validation error'}>
    <Field.Control />
    <Field.Error data-testid="custom-error" match="customError" />
    <Field.Error data-testid="default-error" />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
