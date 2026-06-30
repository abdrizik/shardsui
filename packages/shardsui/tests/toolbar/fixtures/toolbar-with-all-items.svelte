<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  let { disabled = false } = $props()
</script>

<Toolbar.Root {disabled}>
  <Toolbar.Button data-testid="root-btn">Button</Toolbar.Button>
  <Toolbar.Link href="https://example.com" data-testid="root-link">Link</Toolbar.Link>
  <Toolbar.Input value="" data-testid="root-input" />
  <Toolbar.Group data-testid="group">
    <Toolbar.Button data-testid="group-btn">Group Button</Toolbar.Button>
    <Toolbar.Link href="https://example.com" data-testid="group-link">Group Link</Toolbar.Link>
    <Toolbar.Input value="" data-testid="group-input" />
  </Toolbar.Group>
</Toolbar.Root>
