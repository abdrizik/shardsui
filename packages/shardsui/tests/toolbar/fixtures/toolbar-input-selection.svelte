<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  import type { Orientation } from '$lib/internal/types'

  let {
    orientation = 'horizontal',
    inputDisabled = false
  }: { orientation?: Orientation; inputDisabled?: boolean } = $props()
</script>

<Toolbar.Root {orientation}>
  <Toolbar.Button data-testid="button-1">Button 1</Toolbar.Button>
  <Toolbar.Input value="abcd" disabled={inputDisabled} data-testid="input" />
  <Toolbar.Button data-testid="button-2">Button 2</Toolbar.Button>
</Toolbar.Root>
