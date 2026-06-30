<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let showHttps = $state(true)

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
  }
</script>

<Form {onsubmit}>
  <Field.Root name="protocols">
    <CheckboxGroup value={[]}>
      <Field.Item>
        <Checkbox.Root value="http" data-testid="checkbox-http" required />
      </Field.Item>
      {#if showHttps}
        <Field.Item>
          <Checkbox.Root value="https" data-testid="checkbox-https" required />
        </Field.Item>
      {/if}
    </CheckboxGroup>
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="button" onclick={() => (showHttps = false)}>remove</button>
  <button type="submit">submit</button>
</Form>
