import { getNodeName } from '@floating-ui/utils/dom'
import { SHARDSUI_INERT_ATTRIBUTE } from '../constants'

type MarkOthersOptions = {
  ariaHidden?: boolean
  mark?: boolean
}

let ariaHiddenCounterMap = new WeakMap<Element, number>()
let uncontrolledElementsSet = new WeakSet<Element>()
let markerCounterMap = new WeakMap<Element, number>()
let lockCount = 0

function correctElements(parent: HTMLElement, targets: Element[]): Element[] {
  return targets.filter((target) => parent.contains(target))
}

function buildKeepSet(targets: Element[]): Set<Node> {
  const keep = new Set<Node>()

  for (const target of targets) {
    let node: Node | null = target
    while (node && !keep.has(node)) {
      keep.add(node)
      node = node.parentNode
    }
  }

  return keep
}

function collectOutsideElements(
  root: HTMLElement,
  keepElements: Set<Node>,
  stopElements: Set<Node>
): Element[] {
  const outside: Element[] = []

  function walk(parent: Element) {
    if (stopElements.has(parent)) return

    for (const node of parent.children) {
      if (getNodeName(node) === 'script') continue
      if (keepElements.has(node)) {
        walk(node)
      } else {
        outside.push(node)
      }
    }
  }

  walk(root)

  return outside
}

export function markOthers(
  uncorrectedAvoidElements: Element[],
  options: MarkOthersOptions = {}
): () => void {
  const { ariaHidden = false, mark = true } = options
  const body = (uncorrectedAvoidElements[0]?.ownerDocument ?? document).body
  const avoidElements = correctElements(body, uncorrectedAvoidElements)
  const markerTargets = mark
    ? collectOutsideElements(body, buildKeepSet(avoidElements), new Set<Node>(avoidElements))
    : []
  const hiddenElements: Element[] = []
  const markedElements: Element[] = []

  if (ariaHidden) {
    const ariaLiveElements = correctElements(body, Array.from(body.querySelectorAll('[aria-live]')))
    const controlElements = avoidElements.concat(ariaLiveElements)
    const controlTargets = collectOutsideElements(
      body,
      buildKeepSet(controlElements),
      new Set<Node>(controlElements)
    )

    controlTargets.forEach((node) => {
      const attr = node.getAttribute('aria-hidden')
      const alreadyHidden = attr !== null && attr !== 'false'
      const counterValue = (ariaHiddenCounterMap.get(node) || 0) + 1

      ariaHiddenCounterMap.set(node, counterValue)
      hiddenElements.push(node)

      if (counterValue === 1 && alreadyHidden) {
        uncontrolledElementsSet.add(node)
      }

      if (!alreadyHidden) {
        node.setAttribute('aria-hidden', 'true')
      }
    })
  }

  markerTargets.forEach((node) => {
    const markerValue = (markerCounterMap.get(node) || 0) + 1

    markerCounterMap.set(node, markerValue)
    markedElements.push(node)

    if (markerValue === 1) {
      node.setAttribute(SHARDSUI_INERT_ATTRIBUTE, '')
    }
  })

  lockCount += 1

  return () => {
    hiddenElements.forEach((element) => {
      const counterValue = (ariaHiddenCounterMap.get(element) || 0) - 1

      ariaHiddenCounterMap.set(element, counterValue)

      if (!counterValue) {
        if (!uncontrolledElementsSet.has(element)) {
          element.removeAttribute('aria-hidden')
        }

        uncontrolledElementsSet.delete(element)
      }
    })

    markedElements.forEach((element) => {
      const markerValue = (markerCounterMap.get(element) || 0) - 1

      markerCounterMap.set(element, markerValue)

      if (!markerValue) {
        element.removeAttribute(SHARDSUI_INERT_ATTRIBUTE)
      }
    })

    lockCount -= 1

    if (!lockCount) {
      ariaHiddenCounterMap = new WeakMap()
      uncontrolledElementsSet = new WeakSet()
      markerCounterMap = new WeakMap()
    }
  }
}
