<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import SelectScrollArrow from './select-scroll-arrow.svelte'

  type Props = Omit<ComponentProps<typeof SelectScrollArrow>, 'direction'>

  let { ref = $bindable(null), ...rest }: Props = $props()
</script>

<SelectScrollArrow bind:ref {...rest} direction="up" />
