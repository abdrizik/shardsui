<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Switch } from '$lib/components/switch'

  let checked = $state(false)
</script>

<Field.Root>
  <Switch.Root data-testid="switch" bind:checked={() => checked, () => {}}>
    <Switch.Thumb />
  </Switch.Root>
</Field.Root>
