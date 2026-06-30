<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()

  let mounted = $state(true)
</script>

<Form {onFormSubmit}>
  <Field.Root name="group">
    <CheckboxGroup value={[]}>
      {#if mounted}
        <Checkbox.Root value="one" required data-testid="checkbox" />
      {/if}
    </CheckboxGroup>
  </Field.Root>
  <button type="button" onclick={() => (mounted = false)}>Remove</button>
  <button type="submit">Submit</button>
</Form>
