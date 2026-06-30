<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
  let name = $state<string | undefined>('fruits')
</script>

<Form {onFormSubmit}>
  <Field.Root {name}>
    <CheckboxGroup value={['apple']}>
      <Field.Item>
        <Checkbox.Root value="apple" />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="banana" />
      </Field.Item>
    </CheckboxGroup>
  </Field.Root>
  <button type="button" onclick={() => (name = undefined)}>Clear name</button>
  <button type="submit">submit</button>
</Form>
