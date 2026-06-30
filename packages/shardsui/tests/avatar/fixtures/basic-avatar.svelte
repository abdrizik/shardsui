<script lang="ts">
  import { Avatar, type ImageLoadingStatus } from '$lib/components/avatar'

  let {
    src,
    fallbackText = 'AB',
    onLoadingStatusChange
  }: {
    src?: string
    fallbackText?: string
    onLoadingStatusChange?: (status: ImageLoadingStatus) => void
  } = $props()
</script>

<Avatar.Root>
  {#if src !== undefined}
    <Avatar.Image {src} alt="" {onLoadingStatusChange} />
  {/if}
  <Avatar.Fallback>{fallbackText}</Avatar.Fallback>
</Avatar.Root>
