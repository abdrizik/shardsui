<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  import OptionalToolbarConsumer from './optional-toolbar-consumer.svelte'
</script>

<div>
  <OptionalToolbarConsumer />
  <Toolbar.Root orientation="vertical">
    <OptionalToolbarConsumer />
  </Toolbar.Root>
</div>
