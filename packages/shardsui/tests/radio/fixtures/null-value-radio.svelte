<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
</script>

<RadioGroup>
  <Radio.Root value={null} data-testid="radio-null">Null option</Radio.Root>
  <Radio.Root value="a" data-testid="radio-a">Option A</Radio.Root>
</RadioGroup>
