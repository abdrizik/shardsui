<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let errors = $state<Record<string, string | string[]>>({})

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    errors = { group: 'server error' }
  }
</script>

<Form {errors} {onsubmit}>
  <Field.Root name="group">
    <CheckboxGroup value={[]}>
      <fieldset disabled>
        <Checkbox.Root value="disabled" data-testid="disabled" />
      </fieldset>
      <Checkbox.Root value="enabled" data-testid="enabled" />
    </CheckboxGroup>
    <Field.Error />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
