<script lang="ts">
  import { Switch } from '$lib/components/switch'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  let { required = false }: { required?: boolean } = $props()
</script>

<Form>
  <Field.Root>
    <Switch.Root {required} data-testid="switch" />
    <Field.Error data-testid="error" />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
