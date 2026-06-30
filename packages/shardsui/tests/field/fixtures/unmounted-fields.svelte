<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { validateSpy }: { validateSpy: (value: unknown, formValues: unknown) => null } = $props()
  let checked = $state(true)
</script>

<Form>
  <input type="checkbox" data-testid="toggle" {checked} onchange={() => (checked = !checked)} />
  {#if checked}
    <Field.Root name="input1">
      <Field.Control value="one" />
    </Field.Root>
  {/if}
  <Field.Root name="input2" validate={validateSpy}>
    <Field.Control value="two" />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
