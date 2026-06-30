<script lang="ts">
  import { Switch } from '$lib/components/switch'
  let { readOnly = false, checked = $bindable(false) } = $props()
</script>

<label data-testid="label">
  <Switch.Root {readOnly} {checked}>
    <Switch.Thumb />
  </Switch.Root>
  Toggle
</label>
