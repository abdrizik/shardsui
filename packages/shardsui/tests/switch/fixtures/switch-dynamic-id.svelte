<script lang="ts">
  import { Switch } from '$lib/components/switch'
  let { id = $bindable('switch-input-a') } = $props()
</script>

<div>
  <label for="switch-input-a">Label A</label>
  <label for="switch-input-b">Label B</label>
  <Switch.Root {id}>
    <Switch.Thumb />
  </Switch.Root>
  <button type="button" onclick={() => (id = 'switch-input-b')}>Toggle</button>
</div>
