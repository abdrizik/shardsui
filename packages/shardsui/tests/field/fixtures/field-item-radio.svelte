<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { onValueChange = undefined }: { onValueChange?: (value: unknown) => void } = $props()
</script>

<Field.Root name="apple">
  <RadioGroup value="" {onValueChange}>
    <Field.Item disabled>
      <Radio.Root value="fuji-apple" />
    </Field.Item>
    <Field.Item>
      <Radio.Root value="gala-apple" />
    </Field.Item>
  </RadioGroup>
</Field.Root>
