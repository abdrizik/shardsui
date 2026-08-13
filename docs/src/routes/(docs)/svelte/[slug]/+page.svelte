<script lang="ts">
  import { MarkdownDocument } from '@comark/svelte'
  import { components } from '$lib/components/content/components'

  const { data } = $props()
</script>

<article class="prose">
  <MarkdownDocument value={data.tree} {components} />
</article>
