<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Field } from '$lib/components/field'

  let {
    validate = undefined
  }: {
    validate?: (value: unknown) => string | null
  } = $props()

  let value = $state('a')
</script>

<Field.Root validationMode="onChange" {validate} name="choices">
  <RadioGroup bind:value>
    <Field.Item>
      <Radio.Root value="a" data-testid="radio" />
    </Field.Item>
    <Field.Item>
      <Radio.Root value="b" data-testid="radio" />
    </Field.Item>
  </RadioGroup>
</Field.Root>
<button type="button" onclick={() => (value = 'b')}>Select externally</button>
