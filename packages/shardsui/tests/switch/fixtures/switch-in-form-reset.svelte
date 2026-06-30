<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Switch } from '$lib/components/switch'

  let { onSubmit }: { onSubmit: () => void } = $props()

  let checked = $state(false)
  let blocked = $state(true)

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    onSubmit()
  }
</script>

<Form {onsubmit}>
  <Field.Root name="notifications">
    <Switch.Root
      required
      aria-describedby="external-description"
      bind:checked={
        () => checked,
        (next) => {
          if (!blocked) checked = next
        }
      }
    >
      <Switch.Thumb />
    </Switch.Root>
    <Field.Description data-testid="description">Choose a setting</Field.Description>
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit">Submit</button>
  <button type="reset">Reset</button>
  <button type="button" onclick={() => (blocked = false)}>Allow</button>
</Form>
