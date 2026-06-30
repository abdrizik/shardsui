<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'

  let { disabled = false }: { disabled?: boolean } = $props()
</script>

<Toolbar.Root>
  <Toolbar.Input type="checkbox" {disabled} />
</Toolbar.Root>
