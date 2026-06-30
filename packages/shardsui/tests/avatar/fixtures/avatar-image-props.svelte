<script lang="ts">
  import { Avatar } from '$lib/components/avatar'
  import type { ComponentProps } from 'svelte'

  let { ...rest }: ComponentProps<typeof Avatar.Image> = $props()
</script>

<Avatar.Root>
  <Avatar.Image src="test.png" alt="" {...rest} />
</Avatar.Root>
