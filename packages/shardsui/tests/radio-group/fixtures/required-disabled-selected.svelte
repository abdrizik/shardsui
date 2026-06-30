<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
</script>

<Form {onFormSubmit} data-testid="form">
  <Field.Root name="choice">
    <RadioGroup required value="a">
      <Radio.Root value="a" disabled data-testid="item-a" />
      <Radio.Root value="b" data-testid="item-b" />
    </RadioGroup>
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
