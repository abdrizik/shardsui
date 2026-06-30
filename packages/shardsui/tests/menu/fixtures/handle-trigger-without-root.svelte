<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { handle = new Menu.Handle() } = $props()
</script>

<Menu.Trigger {handle} id="trigger-1">Trigger 1</Menu.Trigger>
