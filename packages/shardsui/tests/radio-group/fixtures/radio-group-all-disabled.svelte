<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let disabled = $state(true)
</script>

<Form>
  <Field.Root name="test">
    <RadioGroup name="group" required>
      <Radio.Root value="a" {disabled} data-testid="item-a" />
      <Radio.Root value="b" {disabled} data-testid="item-b" />
    </RadioGroup>
  </Field.Root>
  <button type="button" onclick={() => (disabled = false)}>Enable</button>
  <button type="submit">Submit</button>
</Form>
