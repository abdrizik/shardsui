<script lang="ts">
  import { Toggle } from '$lib/components/toggle'
  import { ToggleGroup } from '$lib/components/toggle-group'
</script>

<ToggleGroup aria-label="My Toggle Group">
  <Toggle value="one">One</Toggle>
  <Toggle value="two">Two</Toggle>
</ToggleGroup>
