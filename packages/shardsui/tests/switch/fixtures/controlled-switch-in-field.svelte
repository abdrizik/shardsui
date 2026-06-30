<script lang="ts">
  import { Switch } from '$lib/components/switch'
  import { Field } from '$lib/components/field'
  import type { FormValidationMode } from '$lib/components/form'
  let {
    validate = undefined,
    validationMode = undefined,
    required = false
  }: {
    validate?: ((value: unknown) => string | null) | undefined
    validationMode?: FormValidationMode | undefined
    required?: boolean
  } = $props()
  let checked = $state(false)
</script>

<div>
  <Field.Root {validate} {validationMode} name="newsletters">
    <Switch.Root
      data-testid="switch"
      {required}
      {checked}
      onCheckedChange={(v) => {
        checked = v
      }}
    >
      <Switch.Thumb />
    </Switch.Root>
  </Field.Root>
  <button
    type="button"
    onclick={() => {
      checked = !checked
    }}>Toggle externally</button
  >
</div>
