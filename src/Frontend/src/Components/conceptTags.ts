const TAG_PATTERN = /(^|[^A-Za-z0-9_/])#([A-Za-z][A-Za-z0-9_-]*)/g;

/** Turn #Concept tags into markdown links, skipping fenced code blocks. */
export function linkifyConceptTags(content: string): string {
  const parts = content.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return parts
    .map((part) => {
      if (part.startsWith("```") || (part.startsWith("`") && part.endsWith("`"))) {
        return part;
      }
      return part.replace(TAG_PATTERN, (_match, prefix: string, name: string) => {
        return `${prefix}[#${name}](concept://${encodeURIComponent(name)})`;
      });
    })
    .join("");
}

export function extractConceptQuery(
  text: string,
  caret: number,
): { start: number; end: number; query: string } | null {
  const before = text.slice(0, caret);
  const match = before.match(/#([A-Za-z0-9_-]*)$/);
  if (!match) {
    return null;
  }
  return {
    start: caret - match[0].length,
    end: caret,
    query: match[1],
  };
}

export function replaceRange(
  text: string,
  start: number,
  end: number,
  replacement: string,
): string {
  return `${text.slice(0, start)}${replacement}${text.slice(end)}`;
}
