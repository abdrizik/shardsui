<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let value = $state([''])
</script>

<CheckboxGroup bind:value>
  <Checkbox.Root value="" data-testid="empty" />
  <Checkbox.Root value="other" data-testid="other" />
</CheckboxGroup>
