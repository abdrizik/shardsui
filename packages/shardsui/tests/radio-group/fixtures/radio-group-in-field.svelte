<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Field } from '$lib/components/field'
  let {
    name = undefined,
    disabled = false,
    validate = undefined,
    validationMode = undefined
  } = $props()
</script>

<Field.Root {name} {disabled} {validate} {validationMode}>
  <RadioGroup data-testid="radio-group">
    <Radio.Root value="a" data-testid="radio-a">Option A<Radio.Indicator /></Radio.Root>
    <Radio.Root value="b" data-testid="radio-b">Option B<Radio.Indicator /></Radio.Root>
    <Radio.Root value="c" data-testid="radio-c">Option C<Radio.Indicator /></Radio.Root>
  </RadioGroup>
  <Field.Error data-testid="error">Error</Field.Error>
</Field.Root>
