<script lang="ts">
  import { DrawerContext } from '$lib/components/drawer/context'

  const drawer = DrawerContext.get()
</script>

<div data-testid="active-snap">{String(drawer.activeSnapPoint)}</div>
