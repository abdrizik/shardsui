<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
</script>

<div>
  <Toolbar.Root>
    <Toolbar.Button data-testid="button" />
    <Toolbar.Input value="abcd" disabled />
  </Toolbar.Root>
  <button type="button" data-testid="after">after</button>
</div>
