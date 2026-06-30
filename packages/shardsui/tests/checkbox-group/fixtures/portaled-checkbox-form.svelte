<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()

  function portal(element: HTMLElement) {
    element.ownerDocument.body.appendChild(element)
    return () => element.remove()
  }
</script>

<Form {onFormSubmit}>
  <Field.Root name="fruits">
    <CheckboxGroup value={['apple']}>
      <div {@attach portal}>
        <Checkbox.Root value="apple" />
      </div>
    </CheckboxGroup>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
