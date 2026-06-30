<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let disabled = $state(true)
</script>

<Form>
  <fieldset {disabled}>
    <Field.Root name="test">
      <RadioGroup required>
        <Radio.Root value="a" data-testid="item-a" />
        <Radio.Root value="b" />
      </RadioGroup>
      <Field.Error match="valueMissing">required</Field.Error>
    </Field.Root>
  </fieldset>
  <button type="button" onclick={() => (disabled = false)}>Enable</button>
  <button type="submit">Submit</button>
</Form>
