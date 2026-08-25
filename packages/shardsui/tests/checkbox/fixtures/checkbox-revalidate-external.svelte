<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field, type FieldValidator } from '$lib/components/field'

  let { validate, required = false }: { validate?: FieldValidator; required?: boolean } = $props()
  let checked = $state(false)
</script>

<Field.Root validationMode="onChange" {validate} name="terms">
  <Checkbox.Root data-testid="checkbox" {required} bind:checked />
</Field.Root>
<button
  type="button"
  onclick={() => {
    checked = !checked
  }}
>
  Toggle externally
</button>
