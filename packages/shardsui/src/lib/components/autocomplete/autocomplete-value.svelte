<script lang="ts">
  import { ComboboxContext } from '$lib/components/combobox/context'
  import type { Snippet } from 'svelte'

  type Props = {
    children?: Snippet<[string]>
  }

  let { children }: Props = $props()

  const combobox = ComboboxContext.get()
</script>

{#if children}
  {@render children(combobox.inputValue)}
{:else}
  {combobox.inputValue}
{/if}
