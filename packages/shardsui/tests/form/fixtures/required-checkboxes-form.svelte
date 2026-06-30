<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root name="a">
    <Checkbox.Root required data-testid="a" />
  </Field.Root>
  <Field.Root name="b">
    <Checkbox.Root required data-testid="b" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
