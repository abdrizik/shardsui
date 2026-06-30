<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()

  function portal(element: HTMLElement) {
    element.ownerDocument.body.appendChild(element)
    return () => element.remove()
  }
</script>

<Form {onFormSubmit} data-testid="form">
  <div {@attach portal}>
    <Field.Root name="choice">
      <RadioGroup value="a">
        <Radio.Root value="a" />
        <Radio.Root value="b" />
      </RadioGroup>
    </Field.Root>
  </div>
  <button type="submit">Submit</button>
</Form>
