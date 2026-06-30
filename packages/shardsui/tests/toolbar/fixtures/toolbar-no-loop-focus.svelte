<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
</script>

<Toolbar.Root loopFocus={false}>
  <Toolbar.Button data-testid="first">First</Toolbar.Button>
  <Toolbar.Button data-testid="last">Last</Toolbar.Button>
</Toolbar.Root>
