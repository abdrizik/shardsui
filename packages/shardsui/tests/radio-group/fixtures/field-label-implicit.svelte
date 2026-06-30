<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Field } from '$lib/components/field'

  let { onValueChange = undefined } = $props()
</script>

<Field.Root name="options">
  <RadioGroup {onValueChange}>
    <Field.Item>
      <Field.Label data-testid="label">
        <Radio.Root value="apple" />
        Apple
      </Field.Label>
    </Field.Item>
    <Field.Item>
      <Field.Label data-testid="label">
        <Radio.Root value="banana" />
        Banana
      </Field.Label>
    </Field.Item>
  </RadioGroup>
</Field.Root>
