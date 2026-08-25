<script lang="ts">
  import { Field, type FieldValidator } from '$lib/components/field'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { validate }: { validate: FieldValidator } = $props()
</script>

<Field.Root validationMode="onBlur" {validate}>
  <RadioGroup value="a">
    <Radio.Root value="a" data-testid="radio-a" />
    <Radio.Root value="b" data-testid="radio-b" />
  </RadioGroup>
</Field.Root>
<button type="button">Outside</button>
