<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()

  let mounted = $state(true)
</script>

<Form {onFormSubmit}>
  <Field.Root name="fruits">
    <CheckboxGroup value={['apple', 'banana']}>
      <Checkbox.Root value="apple" />
      {#if mounted}
        <Checkbox.Root value="banana" data-testid="banana" />
      {/if}
    </CheckboxGroup>
  </Field.Root>
  <button type="button" onclick={() => (mounted = !mounted)}>Toggle</button>
  <button type="submit">Submit</button>
</Form>
