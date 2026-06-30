<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Field } from '$lib/components/field'
  import { Fieldset } from '$lib/components/fieldset'
</script>

<Field.Root name="test">
  <Fieldset.Root>
    <Fieldset.Legend>Legend</Fieldset.Legend>
    <RadioGroup>
      <Field.Item>
        <Radio.Root value="a" />
      </Field.Item>
    </RadioGroup>
  </Fieldset.Root>
</Field.Root>
