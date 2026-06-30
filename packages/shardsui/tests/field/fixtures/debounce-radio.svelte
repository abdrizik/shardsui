<script lang="ts">
  import { Field } from '$lib/components/field'
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { validate }: { validate: (value: unknown) => string | null } = $props()
</script>

<Field.Root validationDebounceTime={100} validationMode="onChange" {validate}>
  <RadioGroup>
    <Radio.Root value="a" data-testid="item-a" />
    <Radio.Root value="b" data-testid="item-b" />
  </RadioGroup>
  <Field.Error />
</Field.Root>
