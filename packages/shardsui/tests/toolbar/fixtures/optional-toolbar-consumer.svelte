<script lang="ts">
  import { ToolbarContext } from '$lib/components/toolbar/context'

  const toolbar = ToolbarContext.getOr()
</script>

<span>{toolbar?.orientation ?? 'outside'}</span>
