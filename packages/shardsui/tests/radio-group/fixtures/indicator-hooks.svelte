<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
</script>

<RadioGroup>
  <Radio.Root value="a" data-testid="a">
    <Radio.Indicator keepMounted data-testid="indicator-a" />
  </Radio.Root>
  <Radio.Root value="b" data-testid="b">
    <Radio.Indicator keepMounted data-testid="indicator-b" />
  </Radio.Root>
</RadioGroup>
