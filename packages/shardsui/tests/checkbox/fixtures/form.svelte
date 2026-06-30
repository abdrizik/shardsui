<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    onsubmit = undefined,
    value = undefined,
    readOnly = false,
    disabled = false,
    as = 'span',
    onkeydown = undefined,
    onFormKeydown = undefined,
    onSubmitClick = undefined
  }: {
    onsubmit?: (event: SubmitEvent) => void
    value?: string
    readOnly?: boolean
    disabled?: boolean
    as?: 'span' | 'button'
    onkeydown?: (event: KeyboardEvent) => void
    onFormKeydown?: (event: KeyboardEvent) => void
    onSubmitClick?: (event: MouseEvent) => void
  } = $props()
</script>

<Form {onsubmit} onkeydown={onFormKeydown}>
  <Field.Root name="test-checkbox">
    <Checkbox.Root {value} {readOnly} {disabled} {as} {onkeydown} />
  </Field.Root>
  <button id="submit-button" type="submit" onclick={onSubmitClick}>Submit</button>
</Form>
