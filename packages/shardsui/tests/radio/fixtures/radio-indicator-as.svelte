<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { as }: { as?: 'span' | 'div' } = $props()
</script>

<RadioGroup value="a">
  <Radio.Root value="a">
    <Radio.Indicator {as} data-testid="indicator" />
  </Radio.Root>
</RadioGroup>
