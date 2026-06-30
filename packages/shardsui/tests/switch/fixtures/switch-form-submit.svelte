<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Switch } from '$lib/components/switch'

  let {
    onData,
    value = undefined,
    disabled = false
  }: {
    onData: (data: FormData) => void
    value?: string
    disabled?: boolean
  } = $props()

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    onData(new FormData(event.currentTarget as HTMLFormElement))
  }
</script>

<Form {onsubmit}>
  <Field.Root name="test-switch">
    <Switch.Root {value} {disabled} data-testid="switch" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
