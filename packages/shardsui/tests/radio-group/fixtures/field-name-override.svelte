<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Field } from '$lib/components/field'
</script>

<Field.Root name="test" data-testid="field">
  <RadioGroup name="group">
    <Field.Item>
      <Radio.Root value="a" data-testid="item" />
    </Field.Item>
  </RadioGroup>
</Field.Root>
