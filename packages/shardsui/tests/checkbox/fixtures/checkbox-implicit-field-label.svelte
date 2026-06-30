<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'

  let checked = $state(false)
</script>

<Field.Root>
  <Field.Label data-testid="label">
    <Checkbox.Root bind:checked>
      <Checkbox.Indicator />
    </Checkbox.Root>
    OK
  </Field.Label>
</Field.Root>
