<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Field } from '$lib/components/field'

  let { onValueChange = undefined } = $props()
</script>

<Field.Root name="options">
  <RadioGroup {onValueChange}>
    <Field.Item>
      <Radio.Root value="apple" />
      <Field.Label data-testid="label">Apple</Field.Label>
      <Field.Description data-testid="description">
        An apple is the round, edible fruit of an apple tree
      </Field.Description>
    </Field.Item>
    <Field.Item>
      <Radio.Root value="banana" />
      <Field.Label data-testid="label">Banana</Field.Label>
      <Field.Description data-testid="description">
        A banana is an elongated, edible fruit
      </Field.Description>
    </Field.Item>
  </RadioGroup>
</Field.Root>
