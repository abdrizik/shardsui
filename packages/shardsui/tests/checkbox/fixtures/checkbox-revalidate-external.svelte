<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'

  let {
    validate = undefined,
    required = false
  }: { validate?: (value: unknown) => string | null; required?: boolean } = $props()
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
