<script lang="ts">
  import { getDirection } from '$lib/components/direction-provider'

  const direction = $derived(getDirection())
</script>

<span data-testid="direction">{direction}</span>
