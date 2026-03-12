export function tokenizeString(text: string, size = 2): string[] {
  const array: string[] = [];

  for (let index = 0; index < text.length; index += size) {
    array.push(text.slice(index, index + size));
  }

  return array;
}
