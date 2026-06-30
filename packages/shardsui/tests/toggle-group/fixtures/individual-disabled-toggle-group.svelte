<script lang="ts">
  import { Toggle } from '$lib/components/toggle'
  import { ToggleGroup } from '$lib/components/toggle-group'
</script>

<ToggleGroup>
  <Toggle value="one">One</Toggle>
  <Toggle value="two" disabled>Two</Toggle>
</ToggleGroup>
