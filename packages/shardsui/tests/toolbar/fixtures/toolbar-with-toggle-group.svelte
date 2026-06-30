<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  import { ToggleGroup } from '$lib/components/toggle-group'
  import { Toggle } from '$lib/components/toggle'
</script>

<Toolbar.Root>
  <ToggleGroup aria-label="Alignment">
    <Toggle value="left" data-testid="toggle-left">Left</Toggle>
    <Toggle value="right" data-testid="toggle-right">Right</Toggle>
  </ToggleGroup>
  <Toolbar.Button data-testid="btn">Bold</Toolbar.Button>
</Toolbar.Root>
