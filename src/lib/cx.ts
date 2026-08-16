/** Tiny classname joiner — drops false/undefined so conditional classes read cleanly. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
