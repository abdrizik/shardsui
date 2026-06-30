<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Switch } from '$lib/components/switch'

  let {
    onFormSubmit
  }: {
    onFormSubmit?: (values: Record<string, unknown>) => void
  } = $props()
</script>

<Form {onFormSubmit}>
  <Field.Root name="username">
    <Field.Label>Username</Field.Label>
    <Field.Control data-testid="username" value="alice" />
  </Field.Root>
  <Field.Root name="subscribe">
    <Switch.Root checked data-testid="subscribe" />
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
