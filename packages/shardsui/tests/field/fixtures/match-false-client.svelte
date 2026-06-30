<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root>
    <Field.Control required />
    <Field.Error data-testid="default-error" match={false} />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
