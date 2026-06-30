<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let firstDisabled = $state(false)
  let errors = $state<Record<string, string | string[]>>({})

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    errors = { group: 'server error' }
  }
</script>

<Form {errors} {onsubmit}>
  <Field.Root name="group">
    <CheckboxGroup value={[]}>
      <Checkbox.Root value="one" data-testid="first" disabled={firstDisabled} />
      <Checkbox.Root value="two" data-testid="second" />
    </CheckboxGroup>
    <Field.Error />
  </Field.Root>
  <button type="button" onclick={() => (firstDisabled = true)}>Disable first</button>
  <button type="submit">Submit</button>
</Form>
