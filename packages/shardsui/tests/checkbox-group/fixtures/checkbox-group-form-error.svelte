<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let errors = $state<Record<string, string | string[]>>({})

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    errors = { group: 'server error' }
  }
</script>

<Form {errors} {onsubmit}>
  <Field.Root name="group">
    <CheckboxGroup value={['one']}>
      <Field.Item>
        <Checkbox.Root value="one" data-testid="checkbox-one" />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="two" data-testid="checkbox-two" />
      </Field.Item>
    </CheckboxGroup>
    <Field.Error data-testid="error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
