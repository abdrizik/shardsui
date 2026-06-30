<script lang="ts">
  import { Switch } from '$lib/components/switch'

  let { ...rest } = $props()
</script>

<Switch.Root>
  <Switch.Thumb data-testid="thumb" {...rest} />
</Switch.Root>
