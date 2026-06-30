<script lang="ts">
  import FocusManagerApp from './focus-manager-app.svelte'

  let target = $state<HTMLInputElement | null>(null)
</script>

<div>
  <input />
  <input data-testid="focus-target" bind:this={target} />
  <input />
  <FocusManagerApp finalFocus={() => target} />
</div>
