<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form errors={{ email: 'Email is already taken' }}>
  <Field.Root>
    <Field.Control name="email" />
    <Field.Error data-testid="default-error" />
  </Field.Root>
</Form>
