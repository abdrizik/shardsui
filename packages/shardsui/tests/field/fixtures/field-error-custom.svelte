<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root validate={() => 'error'}>
    <Field.Control />
    <Field.Error match="customError">Message</Field.Error>
  </Field.Root>
  <button type="submit">submit</button>
</Form>
