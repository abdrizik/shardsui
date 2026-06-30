<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Switch } from '$lib/components/switch'
</script>

<Form errors={{ test: 'test' }}>
  <Field.Root name="test">
    <Switch.Root data-testid="switch" />
    <Field.Error data-testid="error" />
  </Field.Root>
</Form>
