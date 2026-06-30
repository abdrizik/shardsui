<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()

  let disabled = $state(true)
</script>

<Form {onFormSubmit} data-testid="form">
  <fieldset {disabled}>
    <Field.Root name="choice">
      <RadioGroup value="a">
        <Radio.Root value="a" data-testid="item-a" />
        <Radio.Root value="b" data-testid="item-b" />
      </RadioGroup>
    </Field.Root>
  </fieldset>
  <button type="button" onclick={() => (disabled = false)}>Enable</button>
  <button type="submit">Submit</button>
</Form>
