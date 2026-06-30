<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Field } from '$lib/components/field'

  let value = $state<unknown>(undefined)
</script>

<Field.Root>
  <RadioGroup bind:value={() => value, () => {}}>
    <Radio.Root value="a" data-testid="a">A<Radio.Indicator /></Radio.Root>
    <Radio.Root value="b" data-testid="b">B<Radio.Indicator /></Radio.Root>
  </RadioGroup>
</Field.Root>
