<script lang="ts">
  import FocusManagerApp from './focus-manager-app.svelte'
</script>

<FocusManagerApp>
  <!-- svelte-ignore a11y_autofocus -->
  <input autofocus data-testid="input" />
</FocusManagerApp>
