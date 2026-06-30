<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let {
    name = 'test',
    required = false,
    validate = undefined,
    onFormSubmit = undefined
  }: {
    name?: string
    required?: boolean
    validate?: (value: unknown) => string | null
    onFormSubmit?: (values: Record<string, unknown>) => void
  } = $props()
</script>

<Form {onFormSubmit}>
  <Field.Root {name} {validate} data-testid="field">
    <RadioGroup {required} data-testid="group">
      <Radio.Root value="a" data-testid="item-a">A<Radio.Indicator /></Radio.Root>
      <Radio.Root value="b" data-testid="item-b">B<Radio.Indicator /></Radio.Root>
      <Radio.Root value="c" data-testid="item-c">C<Radio.Indicator /></Radio.Root>
    </RadioGroup>
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
