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

// Returns the sentence containing tokens[index], so a word lookup can be
// disambiguated by its context (e.g. "åt" = "to/about", not "ate"). Sentences
// end at . ! ? … or a line break; the terminator stays with its sentence.
const SENTENCE_END_RE = /[.!?…]|\n/;
const MAX_SENTENCE_CHARS = 400;

export function sentenceAround(tokens: { text: string; isWord: boolean }[], index: number): string {
  const ends = (t: { text: string; isWord: boolean }) => !t.isWord && SENTENCE_END_RE.test(t.text);
  let start = index;
  while (start > 0 && !ends(tokens[start - 1])) start--;
  let end = index;
  while (end < tokens.length - 1 && !ends(tokens[end])) end++;
  const sentence = tokens
    .slice(start, end + 1)
    .map((t) => t.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return sentence.length > MAX_SENTENCE_CHARS ? sentence.slice(0, MAX_SENTENCE_CHARS) : sentence;
}
