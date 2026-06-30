<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { onSubmit }: { onSubmit: (event: SubmitEvent) => void } = $props()
</script>

<form onsubmit={onSubmit}>
  <RadioGroup name="test-group">
    <Radio.Root value="option-a" />
    <Radio.Root value="option-b" />
  </RadioGroup>
  <button type="submit">Submit</button>
</form>
