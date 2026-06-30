<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { value = $bindable(undefined), disabled = false, onclick = undefined } = $props()
</script>

<RadioGroup {value}>
  <Radio.Root value="a" data-testid="radio-a" {disabled} {onclick}>
    Option A
    <Radio.Indicator data-testid="indicator-a" />
  </Radio.Root>
  <Radio.Root value="b" data-testid="radio-b">
    Option B
    <Radio.Indicator data-testid="indicator-b" />
  </Radio.Root>
</RadioGroup>
