<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let showFirst = $state(true)
  let errors = $state<Record<string, string | string[]>>({})

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    showFirst = false
    errors = { group: 'server error' }
  }
</script>

<Form {errors} {onsubmit}>
  <Field.Root name="group">
    <CheckboxGroup value={[]}>
      {#if showFirst}
        <Checkbox.Root value="one" data-testid="first" />
      {/if}
      <Checkbox.Root value="two" data-testid="second" />
    </CheckboxGroup>
    <Field.Error />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
