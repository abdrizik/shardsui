<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'
</script>

<RadioGroup>
  <Radio.Root value={undefined} data-testid="radio-undefined">No value</Radio.Root>
  <Radio.Root value="a" data-testid="radio-a">Option A</Radio.Root>
</RadioGroup>
