export function generatePath(
  path: string,
  parameters: Record<string, string | number> = {},
): string {
  return path.replaceAll(/:([a-zA-Z0-9_]+)/g, (match, parameterName) => {
    if (parameters[parameterName] !== undefined) {
      return String(parameters[parameterName]);
    }

    return match;
  });
}
