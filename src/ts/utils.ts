export function isValidRegex(regexStr: string): boolean {
  try {
    new RegExp(regexStr);
    return true;
  } catch (e) {
    return false;
  }
}
