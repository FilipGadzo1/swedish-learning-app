// Splits text into word tokens (Swedish letters incl. å/ä/ö) and
// everything else (whitespace/punctuation), preserving both for rendering.
const WORD_RE = /[A-Za-zÅÄÖåäö]+/g;

export function tokenize(content: string): { text: string; isWord: boolean }[] {
  const tokens: { text: string; isWord: boolean }[] = [];
  let lastIndex = 0;
  for (const match of content.matchAll(WORD_RE)) {
    const index = match.index!;
    if (index > lastIndex) {
      tokens.push({ text: content.slice(lastIndex, index), isWord: false });
    }
    tokens.push({ text: match[0], isWord: true });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < content.length) {
    tokens.push({ text: content.slice(lastIndex), isWord: false });
  }
  return tokens;
}
