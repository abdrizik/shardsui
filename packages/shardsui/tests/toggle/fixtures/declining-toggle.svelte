<script lang="ts">
  import { Toggle } from '$lib/components/toggle'

  let pressed = $state(false)
</script>

<Toggle bind:pressed={() => pressed, () => {}} />
