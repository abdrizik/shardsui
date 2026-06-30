<script lang="ts">
  import { Avatar } from '$lib/components/avatar'

  let {
    showImage = true,
    ontransitionend
  }: {
    showImage?: boolean
    ontransitionend?: (event: TransitionEvent) => void
  } = $props()
</script>

<Avatar.Root>
  <Avatar.Image
    data-testid="image"
    class="animation-test-image"
    {ontransitionend}
    src={showImage ? 'avatar.png' : undefined}
  />
</Avatar.Root>
