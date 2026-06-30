<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'

  let {
    onsubmit = undefined,
    checkboxFirst = false
  }: {
    onsubmit?: (event: SubmitEvent) => void
    checkboxFirst?: boolean
  } = $props()
</script>

{#if checkboxFirst}
  <Checkbox.Root name="test-checkbox" form="external-form" />
  <form id="external-form" {onsubmit}>
    <button type="submit">Submit</button>
  </form>
{:else}
  <form id="external-form" {onsubmit}>
    <button type="submit">Submit</button>
  </form>
  <Checkbox.Root name="test-checkbox" form="external-form" />
{/if}
