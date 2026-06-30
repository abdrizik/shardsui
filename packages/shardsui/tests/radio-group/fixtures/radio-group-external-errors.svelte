<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
</script>

<Form errors={{ test: 'test' }}>
  <Field.Root name="test" data-testid="field">
    <RadioGroup data-testid="radio-group">
      <Field.Item>
        <Radio.Root value="a" data-testid="item-a" />
      </Field.Item>
      <Field.Item>
        <Radio.Root value="b" data-testid="item-b" />
      </Field.Item>
    </RadioGroup>
    <Field.Error data-testid="error" />
  </Field.Root>
</Form>
