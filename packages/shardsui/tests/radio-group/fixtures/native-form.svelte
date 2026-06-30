<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
</script>

<form data-testid="form">
  <RadioGroup name="group">
    <Radio.Root value="a" data-testid="radio-a" />
    <Radio.Root value="b" data-testid="radio-b" />
    <Radio.Root value="c" data-testid="radio-c" />
  </RadioGroup>
</form>
