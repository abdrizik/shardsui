<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Field } from '$lib/components/field'
</script>

<Field.Root name="apple">
  <RadioGroup aria-describedby="external-description">
    <Field.Description data-testid="group-description">Group description</Field.Description>
    <Field.Item>
      <Field.Label>
        <Radio.Root value="fuji-apple" aria-describedby="radio-description" />
        Fuji
      </Field.Label>
    </Field.Item>
  </RadioGroup>
</Field.Root>
