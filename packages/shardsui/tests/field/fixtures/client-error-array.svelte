<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root validate={() => ['First error', 'Second error']}>
    <Field.Control />
    <Field.Error data-testid="default-error" />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
