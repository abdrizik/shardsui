import { Context } from '$lib/internal/context'
import { untrack } from 'svelte'
import { EventEmitter, type Emitter } from './event-emitter'

type FloatingNode = {
  id: string
  parentId: string | null
  dismissBubbles?: { escapeKey: boolean; outsidePress: boolean }
  floating?: HTMLElement | null
  open?: boolean
}

export type FloatingTreeEvents = {
  'floating.closed': MouseEvent
}

export class FloatingTree<E extends FloatingTreeEvents = FloatingTreeEvents> {
  // Deliberately non-reactive — dependents track `version` instead. Making this
  // `$state` makes every reader track every node's `open` getter.
  nodes: FloatingNode[] = []
  events: Emitter<E> = new EventEmitter<E>()
  version = $state(0)

  addNode(node: FloatingNode): void {
    this.nodes.push(node)
    untrack(() => {
      this.version += 1
    })
  }

  removeNode(node: FloatingNode): void {
    const i = this.nodes.indexOf(node)
    if (i !== -1) {
      this.nodes.splice(i, 1)
      untrack(() => {
        this.version += 1
      })
    }
  }
}

export type FloatingNodeContextValue = { readonly id: string }

export const FloatingTreeContext = new Context<FloatingTree>('FloatingTree')
export const FloatingNodeContext = new Context<FloatingNodeContextValue>('FloatingNode')

let nextId = 0
export function nextFloatingId(): string {
  nextId += 1
  return `floating-${nextId}`
}

export function registerFloatingNode<E extends FloatingTreeEvents = FloatingTreeEvents>(options: {
  tree: () => FloatingTree<E>
  id: () => string
  parentId: () => string | null
  open: () => boolean
  floating?: (() => HTMLElement | null) | undefined
}): void {
  $effect(() => {
    const tree = options.tree()
    const node: FloatingNode = {
      id: options.id(),
      parentId: options.parentId(),
      get open() {
        return options.open()
      },
      get floating() {
        return options.floating?.() ?? null
      }
    }
    tree.addNode(node)
    return () => tree.removeNode(node)
  })
}

export function attachFloatingNode<E extends FloatingTreeEvents = FloatingTreeEvents>(options: {
  open: () => boolean
  floating?: (() => HTMLElement | null) | undefined
}): { tree: FloatingTree<E>; nodeId: string; parentNodeId: string | null } {
  const inherited = FloatingTreeContext.getOr()
  const tree = (inherited as FloatingTree<E> | undefined) ?? new FloatingTree<E>()
  if (!inherited) FloatingTreeContext.set(tree as FloatingTree)
  const nodeId = nextFloatingId()
  const parentNodeId = FloatingNodeContext.getOr()?.id ?? null
  registerFloatingNode<E>({
    tree: () => tree,
    id: () => nodeId,
    parentId: () => parentNodeId,
    open: options.open,
    floating: options.floating
  })
  FloatingNodeContext.set({ id: nodeId })
  return { tree, nodeId, parentNodeId }
}

export function getNodeChildren(
  nodes: FloatingNode[],
  parentId: string,
  onlyOpenChildren = true
): FloatingNode[] {
  const directChildren = nodes.filter((n) => n.parentId === parentId)
  return directChildren.flatMap((child) => [
    ...(!onlyOpenChildren || child.open ? [child] : []),
    ...getNodeChildren(nodes, child.id, onlyOpenChildren)
  ])
}

export function getNodeAncestors(nodes: FloatingNode[], nodeId: string): FloatingNode[] {
  const out: FloatingNode[] = []
  let current = nodes.find((n) => n.id === nodeId)?.parentId ?? null
  while (current) {
    const node = nodes.find((n) => n.id === current)
    if (!node) break
    out.push(node)
    current = node.parentId
  }
  return out
}
