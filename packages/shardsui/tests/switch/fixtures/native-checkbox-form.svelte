<script lang="ts">
  let { onData }: { onData: (data: FormData) => void } = $props()

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    onData(new FormData(event.currentTarget as HTMLFormElement))
  }
</script>

<form {onsubmit}>
  <input type="checkbox" name="native" />
  <button type="submit">Submit</button>
</form>
