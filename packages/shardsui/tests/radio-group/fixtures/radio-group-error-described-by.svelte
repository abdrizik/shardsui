<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
</script>

<Form>
  <Field.Root name="test" data-testid="field">
    <RadioGroup name="group" required>
      <Field.Item>
        <Radio.Root value="a" />
        <Field.Description>description</Field.Description>
      </Field.Item>
    </RadioGroup>
    <Field.Error match="valueMissing" data-testid="error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
