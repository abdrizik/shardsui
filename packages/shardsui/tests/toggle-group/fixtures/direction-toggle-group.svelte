<script lang="ts">
  import { DirectionProvider, type TextDirection } from '$lib/components/direction-provider'
  import { Toggle } from '$lib/components/toggle'
  import { ToggleGroup } from '$lib/components/toggle-group'
  import type { Orientation } from '$lib/internal/types'

  let {
    direction = 'rtl',
    orientation = 'horizontal'
  }: { direction?: TextDirection; orientation?: Orientation } = $props()
</script>

<DirectionProvider {direction}>
  <ToggleGroup {orientation}>
    <Toggle value="one">One</Toggle>
    <Toggle value="two">Two</Toggle>
    <Toggle value="three">Three</Toggle>
  </ToggleGroup>
</DirectionProvider>
