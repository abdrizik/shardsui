<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
  let name = $state<string | undefined>('email')
</script>

<Form {onFormSubmit}>
  <Field.Root>
    <Field.Control {name} value="one@example.com" />
  </Field.Root>
  <button type="button" onclick={() => (name = 'alternateEmail')}>Change name</button>
  <button type="button" onclick={() => (name = undefined)}>Clear name</button>
  <button type="submit">submit</button>
</Form>
