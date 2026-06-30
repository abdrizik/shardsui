<script lang="ts">
  import { Switch } from '$lib/components/switch'

  let {
    onData
  }: {
    onData: (data: FormData) => void
  } = $props()

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    onData(new FormData(event.currentTarget as HTMLFormElement))
  }
</script>

<form id="external-form" {onsubmit}>
  <button type="submit">Submit</button>
</form>
<Switch.Root name="test-switch" form="external-form" data-testid="switch" />
