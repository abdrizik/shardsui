<script lang="ts">
  import { Avatar } from '@shardsui/svelte/avatar'
</script>

<div class="flex gap-4">
  <Avatar.Root
    class="inline-flex size-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 align-middle text-sm leading-none font-medium text-gray-900 select-none"
  >
    <Avatar.Image
      src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><linearGradient id='g' x2='1' y2='1'><stop stop-color='%23e2e8f0'/><stop offset='.5' stop-color='%2394a3b8'/><stop offset='1' stop-color='%23334155'/></linearGradient><rect width='100%25' height='100%25' fill='url(%23g)'/></svg>"
      alt="Paul Rand"
      class="size-full object-cover"
    />
    <Avatar.Fallback delay={300} class="flex size-full items-center justify-center">
      PR
    </Avatar.Fallback>
  </Avatar.Root>

  <Avatar.Root
    class="inline-flex size-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 align-middle text-sm leading-none font-medium text-gray-900 select-none"
  >
    <Avatar.Image src="data:," alt="Milton Glaser" class="size-full object-cover" />
    <Avatar.Fallback delay={300} class="flex size-full items-center justify-center">
      MG
    </Avatar.Fallback>
  </Avatar.Root>
</div>
