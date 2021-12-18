export function isValidRegex(regexStr: string): boolean {
  try {
    return Boolean(new RegExp(regexStr));
  } catch (e) {
    return false;
  }
}
