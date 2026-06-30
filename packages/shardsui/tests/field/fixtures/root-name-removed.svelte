<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let rootName = $state<string | undefined>('rootEmail')
</script>

<Form errors={{ email: 'Email is already taken' }}>
  <Field.Root name={rootName}>
    <Field.Control name="email" />
    <Field.Error data-testid="default-error" />
  </Field.Root>
  <button type="button" onclick={() => (rootName = undefined)}>Clear root name</button>
</Form>
