<script lang="ts">
  import { DialogRoot } from '$lib/components/dialog/dialog.svelte'
  import { DrawerProviderContext } from '$lib/components/drawer/context'

  const provider = DrawerProviderContext.get()

  const registered = new DialogRoot()
  const missing = new DialogRoot()
</script>

<button onclick={() => provider.setDrawerOpen(registered, true)}>Register open</button>
<button onclick={() => provider.setDrawerOpen(registered, false)}>Register closed</button>
<button onclick={() => provider.setDrawerOpen(missing, false)}>Remove missing</button>
<button onclick={() => provider.setVisualState({ swipeProgress: 0.5, frontmostHeight: 120 })}>
  Set visual state
</button>
<button onclick={() => provider.setVisualState({ swipeProgress: 0, frontmostHeight: 0 })}>
  Clear visual state
</button>
<button
  onclick={() => provider.setVisualState({ swipeProgress: Number.NaN, frontmostHeight: Infinity })}
>
  Set invalid visual state
</button>
