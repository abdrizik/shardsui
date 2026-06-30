<script lang="ts">
  import { DirectionProvider, type TextDirection } from '$lib/components/direction-provider'
  import { Toolbar } from '$lib/components/toolbar'
  import type { Orientation } from '$lib/internal/types'

  let {
    direction = 'ltr' as TextDirection,
    orientation = 'horizontal'
  }: {
    direction?: TextDirection
    orientation?: Orientation
  } = $props()
</script>

<DirectionProvider {direction}>
  <Toolbar.Root {orientation} dir={direction}>
    <Toolbar.Button data-testid="button-1">Button 1</Toolbar.Button>
    <Toolbar.Link href="https://example.com">Link</Toolbar.Link>
    <Toolbar.Group>
      <Toolbar.Button data-testid="grouped-button-1">Grouped 1</Toolbar.Button>
      <Toolbar.Button data-testid="grouped-button-2">Grouped 2</Toolbar.Button>
    </Toolbar.Group>
    <Toolbar.Input value="" data-testid="input" />
  </Toolbar.Root>
</DirectionProvider>
