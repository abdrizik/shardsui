<script lang="ts">
  import { Avatar } from '$lib/components/avatar'

  let { src = 'avatar.png' }: { src?: string } = $props()
</script>

<Avatar.Root>
  <Avatar.Image
    {src}
    sizes="48px"
    srcset="avatar.png 1x, avatar@2x.png 2x"
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />
</Avatar.Root>
