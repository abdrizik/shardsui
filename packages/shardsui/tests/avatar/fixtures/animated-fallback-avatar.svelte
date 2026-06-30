<script lang="ts">
  import { Avatar } from '$lib/components/avatar'

  let { src }: { src?: string } = $props()
</script>

<Avatar.Root>
  <Avatar.Image data-testid="image" {src} alt="" />
  <Avatar.Fallback data-testid="fallback" class="animation-test-fallback">AC</Avatar.Fallback>
</Avatar.Root>
