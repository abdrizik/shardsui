<script lang="ts">
  import { Switch } from '$lib/components/switch'
  let { id = 'switch-input' } = $props()
</script>

<div>
  <label data-testid="label" for={id}>Toggle</label>
  <Switch.Root {id}>
    <Switch.Thumb />
  </Switch.Root>
</div>
