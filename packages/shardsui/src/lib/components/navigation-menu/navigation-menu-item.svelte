<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { NavigationMenuItemContext } from './context'

  type Props = Omit<PartProps<[], 'li'>, 'value'> & {
    value?: unknown
  }

  let { as = 'li', ref = $bindable(null), value: valueProp, children, ...rest }: Props = $props()

  const uid = $props.id()

  const value = $derived(valueProp ?? uid)

  NavigationMenuItemContext.set({
    get value() {
      return value
    }
  })
</script>

<svelte:element this={as} bind:this={ref} {...rest}>
  {@render children?.()}
</svelte:element>
