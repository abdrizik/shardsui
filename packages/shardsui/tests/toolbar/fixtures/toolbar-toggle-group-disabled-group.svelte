<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  import { ToggleGroup } from '$lib/components/toggle-group'
  import { Toggle } from '$lib/components/toggle'
</script>

<Toolbar.Root>
  <Toolbar.Button data-testid="before">Before</Toolbar.Button>
  <Toolbar.Group disabled>
    <ToggleGroup>
      <Toggle value="one" data-testid="one">One</Toggle>
      <Toggle value="two" data-testid="two">Two</Toggle>
    </ToggleGroup>
  </Toolbar.Group>
  <Toolbar.Button data-testid="after">After</Toolbar.Button>
</Toolbar.Root>
