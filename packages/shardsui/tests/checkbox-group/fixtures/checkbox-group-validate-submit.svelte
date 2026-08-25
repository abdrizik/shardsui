<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field, type FieldValidator } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { validate }: { validate: FieldValidator } = $props()

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
  }
</script>

<Form {onsubmit}>
  <Field.Root name="apple" {validate}>
    <CheckboxGroup value={['fuji-apple', 'gala-apple']}>
      <Field.Item>
        <Checkbox.Root value="fuji-apple" data-testid="button-1" />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="gala-apple" data-testid="button-2" />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="granny-smith-apple" data-testid="button-3" />
      </Field.Item>
    </CheckboxGroup>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
