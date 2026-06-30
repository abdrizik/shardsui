<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
</script>

<RadioGroup value="1" disabled readOnly required>
  <Radio.Root value="1" data-testid="item">
    <Radio.Indicator data-testid="indicator" />
  </Radio.Root>
</RadioGroup>
