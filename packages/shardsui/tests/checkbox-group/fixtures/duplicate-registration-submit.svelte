<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()

  let trimmed = $state(false)
  let element = $state<HTMLFormElement | null>(null)

  $effect(() => {
    if (trimmed) {
      element?.requestSubmit()
    }
  })
</script>

<Form bind:ref={element} {onFormSubmit}>
  <Field.Root name="items">
    <CheckboxGroup value={['one', 'two']}>
      {#if !trimmed}
        <Checkbox.Root value="one" />
      {/if}
      <Checkbox.Root value="two" />
      {#if !trimmed}
        <Checkbox.Root value="two" />
      {/if}
    </CheckboxGroup>
  </Field.Root>
  <button type="button" onclick={() => (trimmed = true)}>Trim</button>
</Form>
