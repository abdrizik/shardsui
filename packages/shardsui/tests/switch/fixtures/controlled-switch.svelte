<script lang="ts">
  import { Switch } from '$lib/components/switch'
  let { checked = $bindable(false) } = $props()
</script>

<div>
  <button onclick={() => (checked = !checked)}>Toggle</button>
  <Switch.Root {checked}>
    <Switch.Thumb />
  </Switch.Root>
</div>
