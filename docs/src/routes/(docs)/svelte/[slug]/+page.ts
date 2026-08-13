import { docs } from '$lib/data/docs'
import { plugins } from '$lib/utils/markdown'
import { transformReferenceTables } from '$lib/utils/reference-tables'
import { error } from '@sveltejs/kit'
import { parseMarkdown } from 'comark/parse'

export const prerender = true

export function entries() {
  return Object.values(docs)
    .flat()
    .map(({ slug }) => ({ slug }))
}

export async function load({ params }) {
  const { slug } = params
  const metadata = Object.values(docs)
    .flat()
    .find((c) => c.slug === slug)

  if (!metadata) {
    throw error(404, `Page not found: ${slug}`)
  }

  let raw: string
  try {
    const module = await import(`$content/${slug}.md?raw`)
    raw = module.default
  } catch {
    throw error(404, `Docs page missing: ${slug}.md`)
  }

  return {
    tree: transformReferenceTables(await parseMarkdown(raw.trim(), { plugins })),
    metadata,
    seo: { title: metadata.title, description: metadata.description }
  }
}
