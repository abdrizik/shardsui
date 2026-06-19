<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { MenuRadioItemContext, type MenuItemIndicatorState } from './context'
  import MenuItemIndicator from './menu-item-indicator.svelte'

  type Props = PartProps<[MenuItemIndicatorState], 'span'> & {
    keepMounted?: boolean
  }

  let { ref = $bindable(null), ...rest }: Props = $props()

  const item = MenuRadioItemContext.get()
</script>

<MenuItemIndicator {item} bind:ref {...rest} />
