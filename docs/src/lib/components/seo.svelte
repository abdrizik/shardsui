<script lang="ts">
  import { siteName, siteUrl } from '$lib/data/site'

  type Props = {
    title: string
    description: string
    path?: string
  }

  let { title, description, path = '/' }: Props = $props()

  const url = $derived(new URL(path, siteUrl).href)
  const image = $derived(new URL('/og.png', siteUrl).href)
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content="en" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta
    property="og:image:alt"
    content="ShardsUI — Unstyled, accessible UI components for Svelte"
  />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>
