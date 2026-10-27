const EXCERPT_LENGTH = 80;

export function summarizeContent(content: string) {
  const collapsed = content.replace(/\s+/g, " ").trim();
  const excerpt =
    collapsed.length > EXCERPT_LENGTH
      ? `${collapsed.slice(0, EXCERPT_LENGTH).trimEnd()}…`
      : collapsed;
  const wordCount = collapsed ? collapsed.split(" ").length : 0;
  return { excerpt, readingMinutes: Math.max(1, Math.round(wordCount / 200)) };
}
