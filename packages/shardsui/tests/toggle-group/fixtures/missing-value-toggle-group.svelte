<script lang="ts">
  import { Toggle } from '$lib/components/toggle'
  import { ToggleGroup } from '$lib/components/toggle-group'
</script>

<ToggleGroup value={['one']}>
  <Toggle />
  <Toggle />
</ToggleGroup>
