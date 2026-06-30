<script lang="ts">
  import { Toggle } from '$lib/components/toggle'

  let pressed = $state(false)
</script>

<input type="checkbox" checked={pressed} onchange={() => (pressed = !pressed)} />
<Toggle {pressed} />
