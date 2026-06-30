<script lang="ts">
  import { Switch } from '$lib/components/switch'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  let { required = false }: { required?: boolean } = $props()
</script>

<Form>
  <Field.Root name="test">
    <Switch.Root {required} data-testid="switch" />
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
