<script lang="ts">
  import DismissPortalLayer from './dismiss-portal-layer.svelte'

  let otherContainer = $state<HTMLDivElement | null>(null)
</script>

<DismissPortalLayer triggerText="open 1">
  <DismissPortalLayer triggerText="open 2" container={otherContainer}>
    <button>nested</button>
  </DismissPortalLayer>
</DismissPortalLayer>
<div bind:this={otherContainer}></div>
