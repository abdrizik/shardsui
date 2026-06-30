<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'

  let { readOnly = false }: { readOnly?: boolean } = $props()
</script>

<label data-testid="label">
  <Checkbox.Root {readOnly} />
  Toggle
</label>
