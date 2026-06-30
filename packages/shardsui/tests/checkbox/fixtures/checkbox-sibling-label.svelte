<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  let { id = 'checkbox-input-a' } = $props()
</script>

<div>
  <label for="checkbox-input-a">Label A</label>
  <label for="checkbox-input-b">Label B</label>
  <Checkbox.Root {id} />
</div>
