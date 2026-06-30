<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { value = $bindable('a') } = $props()
</script>

<div>
  <button onclick={() => (value = 'b')}>Close</button>
  <RadioGroup {value}>
    <Radio.Root value="a">
      <Radio.Indicator class="animation-test-indicator" data-testid="indicator-a" />
    </Radio.Root>
    <Radio.Root value="a">
      <Radio.Indicator class="animation-test-indicator" />
    </Radio.Root>
  </RadioGroup>
</div>
