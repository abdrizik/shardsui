export const prerender = true

const content = import.meta.glob<string>('/src/content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

const demos = new Set(
  Object.keys(
    import.meta.glob('/src/lib/components/content/demos/**/demo.svelte', { eager: true })
  ).flatMap((path) => {
    const name = path.match(/\/demos\/(.+)\/demo\.svelte$/)?.[1]
    return name ? [name] : []
  })
)

/** Content files whose demos live under a different slug. */
const slugFor: Record<string, string> = { forms: 'form' }

const demoEntries: { name: string; title: string }[] = []
const seen = new Set<string>()

for (const [path, md] of Object.entries(content)) {
  const file = path.match(/\/([^/]+)\.md$/)?.[1] ?? ''
  const slug = slugFor[file] ?? file
  let title = ''

  for (const line of md.split('\n')) {
    const heading = line.match(/^#{1,6}\s+(.+)$/)
    if (heading) title = heading[1]

    const name = line.match(/:demo\{name="([^"]+)"\}/)?.[1]
    if (
      !name?.startsWith(`${slug}/`) ||
      name.endsWith('/hero') ||
      !demos.has(name) ||
      seen.has(name)
    ) {
      continue
    }

    seen.add(name)
    demoEntries.push({ name, title })
  }
}

export function load() {
  return {
    demoEntries,
    seo: {
      title: 'Gallery — ShardsUI component demos',
      description: 'Hero and example demos for every ShardsUI component.'
    }
  }
}
