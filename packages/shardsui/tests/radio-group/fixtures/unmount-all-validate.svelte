<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let {
    onFormSubmit,
    validate
  }: {
    onFormSubmit: (values: Record<string, unknown>) => void
    validate: () => string | null
  } = $props()

  let mounted = $state(true)
</script>

<Form {onFormSubmit}>
  <Field.Root name="choice" {validate}>
    <RadioGroup>
      {#if mounted}
        <Radio.Root value="a" />
      {/if}
    </RadioGroup>
    <Field.Error data-testid="error" />
  </Field.Root>
  <button type="button" onclick={() => (mounted = false)}>Remove</button>
  <button type="submit">Submit</button>
</Form>
