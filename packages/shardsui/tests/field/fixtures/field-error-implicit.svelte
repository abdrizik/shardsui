<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root>
    <Field.Control required />
    <Field.Error>Message</Field.Error>
  </Field.Root>
  <button type="submit">submit</button>
</Form>
