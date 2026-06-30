<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Switch } from '$lib/components/switch'

  let { onsubmit }: { onsubmit?: (event: SubmitEvent) => void } = $props()
</script>

<Form {onsubmit}>
  <Field.Root name="shared">
    <Switch.Root required data-testid="first" />
    <Field.Error data-testid="first-error" />
  </Field.Root>
  <Field.Root name="shared">
    <Switch.Root required checked data-testid="second" />
    <Field.Error data-testid="second-error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
