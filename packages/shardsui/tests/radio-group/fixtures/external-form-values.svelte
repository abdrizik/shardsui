<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
</script>

<form id="external-form"></form>
<Form {onFormSubmit} data-testid="form">
  <Field.Root name="choice">
    <RadioGroup form="external-form" value="a">
      <Radio.Root value="a" data-testid="item-a" />
      <Radio.Root value="b" data-testid="item-b" />
    </RadioGroup>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
