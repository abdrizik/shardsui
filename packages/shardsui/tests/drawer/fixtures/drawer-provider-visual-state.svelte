<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
  import ProviderControls from './provider-controls.svelte'
</script>

<Drawer.Provider>
  <Drawer.IndentBackground data-testid="background" />
  <Drawer.Indent data-testid="indent" />
  <ProviderControls />
</Drawer.Provider>
