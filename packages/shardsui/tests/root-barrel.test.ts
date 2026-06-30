import * as root from '$lib/index'
import { expect } from 'vitest'

const barrels = import.meta.glob('../src/lib/components/*/index.ts')

function namespaceName(dir: string): string {
  return dir
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

const directories = Object.keys(barrels)
  .map((path) => path.match(/components\/([^/]+)\/index\.ts$/)?.[1])
  .filter((dir): dir is string => dir !== undefined)
  .sort()

describe('root barrel', () => {
  it('finds every component directory', () => {
    expect(directories.length).toBeGreaterThan(30)
  })

  it.each(directories)('exports %s', (dir) => {
    expect(root).toHaveProperty(namespaceName(dir))
  })
})
