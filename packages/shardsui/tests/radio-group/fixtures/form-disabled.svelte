<script lang="ts">
  import { untrack } from 'svelte'
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { onFormSubmit = undefined, initialDisabled = false } = $props()

  let disabled = $state(untrack(() => initialDisabled))
</script>

<Form {onFormSubmit} data-testid="form">
  <Field.Root name="test">
    <RadioGroup name="group" value="a">
      <Radio.Root value="a" {disabled} data-testid="item-a" />
      <Radio.Root value="b" data-testid="item-b" />
    </RadioGroup>
  </Field.Root>
  <button type="button" data-testid="toggle" onclick={() => (disabled = !disabled)}>Toggle</button>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
