<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form errors={{ username: 'Username is reserved' }}>
  <Field.Root name="username">
    <Field.Control value="admin" required minlength={8} pattern="[a-z]+" />
    <Field.Error match="valueMissing">Username is required.</Field.Error>
    <Field.Error match="tooShort">Username must be at least 8 characters.</Field.Error>
    <Field.Error match="patternMismatch">Username can only include lowercase letters.</Field.Error>
    <Field.Error data-testid="default-error" />
  </Field.Root>
</Form>
