<script lang="ts">
  let { onsubmit = undefined }: { onsubmit?: (event: SubmitEvent) => void } = $props()
</script>

<form {onsubmit}>
  <input type="checkbox" name="native" />
  <button type="submit">Submit</button>
</form>
