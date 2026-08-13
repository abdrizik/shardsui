<script lang="ts">
  import { Button } from '@shardsui/svelte/button'

  let enrolling = $state(false)
</script>

<Button
  class="font-inherit m-0 flex h-8 items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm/6 font-normal text-nowrap text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-disabled:text-gray-500 hover:data-disabled:bg-gray-50"
  disabled={enrolling}
  onclick={async () => {
    enrolling = true
    await new Promise((resolve) => setTimeout(resolve, 3000))
    enrolling = false
  }}
>
  {enrolling ? 'Enrolling' : 'Enroll'}
</Button>
