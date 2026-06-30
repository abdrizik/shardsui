<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { onSubmit = undefined }: { onSubmit?: (event: SubmitEvent) => void } = $props()
</script>

<form id="external-form" onsubmit={onSubmit}>
  <button type="submit">Submit</button>
</form>
<RadioGroup name="group" form="external-form" value="b">
  <Radio.Root value="a" />
  <Radio.Root value="b" />
</RadioGroup>
