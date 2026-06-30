import { containsThroughPortals, portalTo } from '$lib/internal/floating/portal'
import { beforeEach, describe, expect, it } from 'vitest'

function portalDiv() {
  const el = document.createElement('div')
  el.setAttribute('data-shards-ui-portal', '')
  return el
}

describe('portalTo', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('moves the node into the container and removes it on cleanup', () => {
    const origin = document.createElement('div')
    const node = portalDiv()
    origin.appendChild(node)
    const container = document.createElement('div')
    document.body.append(origin, container)

    const cleanup = portalTo(container)(node)
    expect(node.parentElement).toBe(container)

    cleanup?.()
    expect(node.parentElement).toBeNull()
  })

  it('falls back to the nearest enclosing portal, then the body', () => {
    const outer = portalDiv()
    const origin = document.createElement('div')
    outer.appendChild(origin)
    document.body.appendChild(outer)

    const nested = portalDiv()
    origin.appendChild(nested)
    portalTo(null)(nested)
    expect(nested.parentElement).toBe(outer)

    const loose = portalDiv()
    const looseOrigin = document.createElement('div')
    looseOrigin.appendChild(loose)
    document.body.appendChild(looseOrigin)
    portalTo(null)(loose)
    expect(loose.parentElement).toBe(document.body)
  })

  it('keeps the logical origin when the container changes', () => {
    const outer = portalDiv()
    const origin = document.createElement('div')
    outer.appendChild(origin)

    const node = portalDiv()
    origin.appendChild(node)
    const inner = document.createElement('span')
    node.appendChild(inner)

    const containerA = document.createElement('div')
    const containerB = document.createElement('div')
    document.body.append(outer, containerA, containerB)

    const cleanup = portalTo(containerA)(node)
    expect(containsThroughPortals(outer, inner)).toBe(true)

    cleanup?.()
    portalTo(containerB)(node)
    expect(node.parentElement).toBe(containerB)
    expect(containsThroughPortals(outer, inner)).toBe(true)
  })

  it('returns to the enclosing portal when the container is cleared', () => {
    const outer = portalDiv()
    const origin = document.createElement('div')
    outer.appendChild(origin)

    const node = portalDiv()
    origin.appendChild(node)

    const container = document.createElement('div')
    document.body.append(outer, container)

    const cleanup = portalTo(container)(node)
    expect(node.parentElement).toBe(container)

    cleanup?.()
    portalTo(undefined)(node)
    expect(node.parentElement).toBe(outer)
  })
})
