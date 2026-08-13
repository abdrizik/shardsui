import type { Component } from 'svelte'

const components = import.meta.glob<Component>('/src/lib/components/content/demos/**/demo.svelte', {
  import: 'default',
  eager: true
})

const sources = import.meta.glob('/src/lib/components/content/demos/**/demo.svelte', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

function demoPath(name: string): string {
  return `/src/lib/components/content/demos/${name}/demo.svelte`
}

export function getDemoComponent(name: string): Component | undefined {
  return components[demoPath(name)]
}

export function getDemoSource(name: string): string {
  return sources[demoPath(name)] ?? ''
}
