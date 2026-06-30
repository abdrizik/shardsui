<script lang="ts">
  import { Avatar } from '$lib/components/avatar'
  import type { ComponentProps } from 'svelte'

  let { ...rest }: ComponentProps<typeof Avatar.Fallback> = $props()
</script>

<Avatar.Root>
  <Avatar.Fallback {...rest} />
</Avatar.Root>
