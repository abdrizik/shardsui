<script lang="ts">
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { validate }: { validate: () => string | null } = $props()

  let form = $state<ReturnType<typeof Form>>()
</script>

<Form bind:this={form}>
  <Field.Root name="group" {validate}>
    <CheckboxGroup value={[]} />
  </Field.Root>
</Form>
<button type="button" onclick={() => form?.validate('group')}>Validate</button>
