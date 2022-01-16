export function isValidRegex(regexStr: string): boolean {
  try {
    return Boolean(new RegExp(regexStr));
  } catch (e) {
    return false;
  }
}

export function nodeIsElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}
