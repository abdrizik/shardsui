<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()

  function portal(element: HTMLElement) {
    const doc = element.ownerDocument
    const externalForm = doc.createElement('form')
    doc.body.appendChild(externalForm)
    externalForm.appendChild(element)
    return () => {
      element.remove()
      externalForm.remove()
    }
  }
</script>

<Form {onFormSubmit}>
  <Field.Root name="group">
    <CheckboxGroup value={[]}>
      <div {@attach portal}>
        <Checkbox.Root value="external" required />
      </div>
    </CheckboxGroup>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
