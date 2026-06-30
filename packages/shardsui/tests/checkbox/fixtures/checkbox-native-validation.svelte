<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root name="test">
    <Checkbox.Root required />
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
