<script lang="ts">
  import { Switch } from '$lib/components/switch'
  import type { Attachment } from 'svelte/attachments'

  const interact: Attachment<HTMLElement> = (element) => {
    element.focus()
    element.blur()
    element.click()
  }
</script>

<Switch.Root {@attach interact}>
  <Switch.Thumb />
</Switch.Root>
