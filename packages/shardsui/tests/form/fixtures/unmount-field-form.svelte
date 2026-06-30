<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let { onsubmit }: { onsubmit?: (event: SubmitEvent) => void } = $props()
  let checked = $state(true)
</script>

<Form {onsubmit}>
  <Field.Root name="name">
    <Field.Control value="Alice" />
  </Field.Root>

  <input
    type="checkbox"
    {checked}
    onchange={() => {
      checked = !checked
    }}
  />

  {#if checked}
    <Field.Root name="email">
      <Field.Control value="" required data-testid="email" />
    </Field.Root>
  {/if}

  <button>Submit</button>
</Form>
