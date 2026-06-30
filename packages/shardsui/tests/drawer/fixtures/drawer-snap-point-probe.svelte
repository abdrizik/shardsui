<script lang="ts">
  import { DrawerViewportContext } from '$lib/components/drawer/context'

  const viewport = DrawerViewportContext.get()
</script>

<output data-testid="snap-point-probe">{String(viewport.activeSnapPointOffset)}</output>
