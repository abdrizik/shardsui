<script lang="ts">
  import { Avatar } from '$lib/components/avatar'

  let { delay }: { delay?: number } = $props()
</script>

<Avatar.Root>
  <Avatar.Image />
  <Avatar.Fallback {delay}>AC</Avatar.Fallback>
</Avatar.Root>
