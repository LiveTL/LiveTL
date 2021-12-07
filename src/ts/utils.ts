export function validateRegex(regexStr: string): RegExp | null {
  try {
    return new RegExp(regexStr);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return null;
    }
    throw e;
  }
}
