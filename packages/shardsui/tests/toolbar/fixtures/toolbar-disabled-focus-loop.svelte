<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
</script>

<Toolbar.Root>
  <Toolbar.Button data-testid="button-1" disabled>Button 1</Toolbar.Button>
  <Toolbar.Group>
    <Toolbar.Button data-testid="grouped-button-1" disabled>Grouped 1</Toolbar.Button>
    <Toolbar.Button data-testid="grouped-button-2" disabled>Grouped 2</Toolbar.Button>
  </Toolbar.Group>
  <Toolbar.Input value="" disabled data-testid="input" />
</Toolbar.Root>
