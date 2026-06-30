<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'

  let checked = $state(false)
</script>

<Field.Root>
  <Field.Label>Label</Field.Label>
  <Checkbox.Root bind:checked data-testid="checkbox">
    <Checkbox.Indicator />
  </Checkbox.Root>
</Field.Root>
