import {
  FloatingTree,
  getNodeAncestors,
  getNodeChildren
} from '$lib/internal/floating/floating-tree.svelte'
import { flushSync } from 'svelte'
import { expect, it, vi } from 'vitest'

type TestNode = {
  id: string
  parentId: string | null
  floating?: HTMLElement | null
  readonly open?: boolean
}

function makeNode(id: string, parentId: string | null = null, open = true): TestNode {
  const el = document.createElement('div')
  return {
    id,
    parentId,
    get open() {
      return open
    },
    get floating() {
      return el
    }
  }
}

describe('FloatingTree', () => {
  it('drives a derived that reads version before walking the plain nodes array', () => {
    const cleanup = $effect.root(() => {
      const tree = new FloatingTree()
      const root = makeNode('root')
      tree.addNode(root)

      const childIds = $derived.by(() => {
        void tree.version
        return getNodeChildren(tree.nodes, 'root').map((n) => n.id)
      })
      const read = () => childIds

      flushSync()
      expect(read()).toEqual([])

      tree.addNode(makeNode('child', 'root'))
      flushSync()
      expect(read()).toEqual(['child'])

      tree.addNode(makeNode('grandchild', 'child'))
      flushSync()
      expect(read()).toEqual(['child', 'grandchild'])

      tree.removeNode(tree.nodes[1])
      flushSync()
      expect(read()).toEqual([])
    })

    cleanup()
  })

  it('does not notify a reaction that only reads the nodes array', () => {
    const cleanup = $effect.root(() => {
      const tree = new FloatingTree()
      const run = vi.fn()

      $effect(() => {
        run(tree.nodes.length)
      })

      flushSync()
      expect(run).toHaveBeenCalledTimes(1)

      tree.addNode(makeNode('a'))
      flushSync()

      expect(run).toHaveBeenCalledTimes(1)
    })

    cleanup()
  })

  it('lets an effect register a node without making itself a version dependency', () => {
    const cleanup = $effect.root(() => {
      const tree = new FloatingTree()
      const run = vi.fn()

      $effect(() => {
        run()
        const node = makeNode('a')
        tree.addNode(node)
        return () => tree.removeNode(node)
      })

      flushSync()

      expect(run).toHaveBeenCalledTimes(1)
      expect(tree.nodes).toHaveLength(1)
    })

    cleanup()
  })
})

describe('getNodeChildren', () => {
  it('collects direct and transitive descendants in depth-first order', () => {
    const nodes = [
      makeNode('root'),
      makeNode('a', 'root'),
      makeNode('a1', 'a'),
      makeNode('b', 'root'),
      makeNode('other')
    ]

    expect(getNodeChildren(nodes, 'root').map((n) => n.id)).toEqual(['a', 'a1', 'b'])
  })

  it('skips closed nodes but still walks through them', () => {
    const nodes = [
      makeNode('root'),
      makeNode('closed', 'root', false),
      makeNode('deep', 'closed', true)
    ]

    expect(getNodeChildren(nodes, 'root').map((n) => n.id)).toEqual(['deep'])
  })

  it('includes closed nodes when onlyOpenChildren is false', () => {
    const nodes = [makeNode('root'), makeNode('closed', 'root', false)]

    expect(getNodeChildren(nodes, 'root', false).map((n) => n.id)).toEqual(['closed'])
  })

  it('handles deep parent structures correctly (onlyOpenChildren=true)', () => {
    const nodes = [
      makeNode('0'),
      makeNode('1', '0'),
      makeNode('2', '1', false),
      makeNode('3', '2'),
      makeNode('4', '2', false),
      makeNode('5', '0'),
      makeNode('6', '5')
    ]

    expect(getNodeChildren(nodes, '0', true).map((n) => n.id)).toEqual(['1', '3', '5', '6'])
  })

  it('includes open descendants behind contextless intermediary nodes', () => {
    const nodes = [makeNode('0'), { id: '1', parentId: '0' }, makeNode('2', '1')]

    expect(getNodeChildren(nodes, '0', true).map((n) => n.id)).toEqual(['2'])
  })

  it('handles deep parent structures correctly (onlyOpenChildren=false)', () => {
    const nodes = [
      makeNode('0'),
      makeNode('1', '0'),
      makeNode('2', '1', false),
      makeNode('3', '2'),
      makeNode('4', '2', false),
      makeNode('5', '0'),
      makeNode('6', '5')
    ]

    expect(getNodeChildren(nodes, '0', false).map((n) => n.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6'
    ])
  })

  it('treats a node without an open getter as closed', () => {
    const nodes = [makeNode('root'), { id: 'plain', parentId: 'root' }]

    expect(getNodeChildren(nodes, 'root')).toEqual([])
    expect(getNodeChildren(nodes, 'root', false).map((n) => n.id)).toEqual(['plain'])
  })
})

describe('getNodeAncestors', () => {
  it('walks parentId upwards from nearest to root', () => {
    const nodes = [makeNode('root'), makeNode('mid', 'root'), makeNode('leaf', 'mid')]

    expect(getNodeAncestors(nodes, 'leaf').map((n) => n.id)).toEqual(['mid', 'root'])
  })
})
