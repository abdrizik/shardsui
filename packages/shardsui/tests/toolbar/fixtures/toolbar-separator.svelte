<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  import type { Orientation } from '$lib/internal/types'

  let {
    orientation = 'horizontal',
    separatorOrientation
  }: { orientation?: Orientation; separatorOrientation?: Orientation } = $props()
</script>

<Toolbar.Root {orientation}>
  <Toolbar.Separator orientation={separatorOrientation} />
</Toolbar.Root>
