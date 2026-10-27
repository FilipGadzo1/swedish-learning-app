import type { ReactNode } from "react";

export type GrammarLesson = {
  slug: string;
  title: string;
  summary: string;
  body: ReactNode;
};

function ExampleTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="my-3 w-full text-sm">
      <tbody>
        {rows.map(([sv, en]) => (
          <tr key={sv} className="border-b border-hairline last:border-b-0">
            <td className="py-1.5 pr-4 font-serif">{sv}</td>
            <td className="py-1.5 text-muted">{en}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    slug: "en-vs-ett",
    title: "Nouns and gender: en vs ett",
    summary: "Why every Swedish noun is either an en-word or an ett-word.",
    body: (
      <>
        <p>
          Every Swedish noun belongs to one of two genders: <strong>en</strong>-words
          (about 75% of nouns) and <strong>ett</strong>-words (about 25%). The gender
          determines the indefinite article, and later the definite ending, so it&rsquo;s
          worth learning the gender along with each new word, not as an afterthought.
        </p>
        <p>
          There&rsquo;s no reliable rule for predicting a noun&rsquo;s gender from its meaning
          or spelling — it has to be memorized per word, the same way French or German
          gender does.
        </p>
        <ExampleTable
          rows={[
            ["en bil", "a car"],
            ["en katt", "a cat"],
            ["en bok", "a book"],
            ["ett hus", "a house"],
            ["ett barn", "a child"],
            ["ett äpple", "an apple"],
          ]}
        />
        <p>
          A practical habit: when you look up a new noun in the reader, its gender is
          shown right in the grammar panel — get used to reading it every time, even
          for words you think you already know.
        </p>
      </>
    ),
  },
  {
    slug: "definite-forms",
    title: "The definite form: hunden, huset",
    summary: '"The dog" and "the house" — definite nouns as a suffix, not a separate word.',
    body: (
      <>
        <p>
          English says &ldquo;the dog&rdquo; with a separate word, <em>the</em>. Swedish instead
          attaches an ending directly onto the noun. Which ending depends on the
          noun&rsquo;s gender:
        </p>
        <ul className="my-3 list-disc pl-5 text-sm">
          <li><strong>en</strong>-words add <strong>-en</strong> (or <strong>-n</strong> if the word already ends in a vowel)</li>
          <li><strong>ett</strong>-words add <strong>-et</strong> (or <strong>-t</strong> if the word already ends in a vowel)</li>
        </ul>
        <ExampleTable
          rows={[
            ["en bil → bilen", "a car → the car"],
            ["en katt → katten", "a cat → the cat"],
            ["en flicka → flickan", "a girl → the girl"],
            ["ett hus → huset", "a house → the house"],
            ["ett äpple → äpplet", "an apple → the apple"],
          ]}
        />
        <p>
          This is why the reader&rsquo;s grammar panel shows both a &ldquo;singular
          (indefinite)&rdquo; and a &ldquo;singular (definite)&rdquo; form — they&rsquo;re genuinely
          different words you need to recognize, not a typo.
        </p>
      </>
    ),
  },
  {
    slug: "plural-forms",
    title: "Making nouns plural",
    summary: "Five plural patterns, and how to tell them apart.",
    body: (
      <>
        <p>
          Swedish nouns fall into a handful of plural patterns (traditionally called
          declensions). There&rsquo;s no single rule, but the ending often hints at the
          pattern:
        </p>
        <ExampleTable
          rows={[
            ["en bil → bilar", "a car → cars (-ar)"],
            ["en lampa → lampor", "a lamp → lamps (-or)"],
            ["ett hus → hus", "a house → houses (no change)"],
            ["ett äpple → äpplen", "an apple → apples (-n)"],
            ["ett barn → barn", "a child → children (no change)"],
          ]}
        />
        <p>
          The definite plural (&ldquo;the cars&rdquo;) adds <strong>-na</strong> or{" "}
          <strong>-en</strong> on top of the plural form: <em>bilarna</em> (the cars),{" "}
          <em>husen</em> (the houses). This is the fourth row you&rsquo;ll see in the
          reader&rsquo;s noun grammar table, alongside singular indefinite, singular
          definite, and plural indefinite.
        </p>
      </>
    ),
  },
  {
    slug: "present-tense",
    title: "Present tense verbs",
    summary: "One form per verb, no matter who's doing the action.",
    body: (
      <>
        <p>
          Modern Swedish verbs don&rsquo;t change for person or number — <em>jag läser</em>{" "}
          (I read), <em>du läser</em> (you read), and <em>de läser</em> (they read) all
          use the same verb form. This makes present tense genuinely simpler than
          English, which still has to distinguish &ldquo;I read&rdquo; from &ldquo;she reads.&rdquo;
        </p>
        <p>
          Most present-tense verbs end in <strong>-r</strong>: the infinitive{" "}
          <em>läsa</em> (to read) becomes <em>läser</em>; <em>tala</em> (to speak)
          becomes <em>talar</em>. A handful of common verbs are irregular — most
          importantly <em>vara</em> (to be) → <em>är</em>, and <em>ha</em> (to have) →{" "}
          <em>har</em>.
        </p>
        <ExampleTable
          rows={[
            ["Jag läser en bok.", "I read / am reading a book."],
            ["Hon talar svenska.", "She speaks Swedish."],
            ["Vi är trötta.", "We are tired."],
          ]}
        />
      </>
    ),
  },
  {
    slug: "past-tense-and-perfect",
    title: "Past tense and the perfect",
    summary: "Imperfekt vs. har + supine — and when to use each.",
    body: (
      <>
        <p>
          Swedish has two main past forms, and they aren&rsquo;t interchangeable the way
          English sometimes lets &ldquo;I read it&rdquo; and &ldquo;I&rsquo;ve read it&rdquo; blur together.
        </p>
        <p>
          <strong>Past tense (imperfekt)</strong> is for a completed action at a
          specific point in the past: <em>Jag läste boken igår</em> (I read the book
          yesterday).
        </p>
        <p>
          <strong>Perfect tense</strong> is formed with <em>har</em> + the verb&rsquo;s{" "}
          <strong>supine</strong> form, and is used when the past action is relevant
          to now, or when no specific time is mentioned: <em>Jag har läst boken</em>{" "}
          (I have read the book).
        </p>
        <ExampleTable
          rows={[
            ["läsa → läste → har läst", "to read → read → have read"],
            ["tala → talade → har talat", "to speak → spoke → have spoken"],
            ["vara → var → har varit", "to be → was → have been"],
          ]}
        />
        <p>
          This is exactly why the reader&rsquo;s verb grammar panel always shows all four
          forms (infinitive, present, past, supine) together — you need past and
          supine side by side to use them correctly.
        </p>
      </>
    ),
  },
  {
    slug: "word-order",
    title: "Word order: the V2 rule",
    summary: "The verb is always in second position — even when something else leads the sentence.",
    body: (
      <>
        <p>
          Swedish is a &ldquo;verb-second&rdquo; (V2) language: the finite verb is always the
          second grammatical element in a main clause, no matter what comes first.
          When the subject leads, this looks just like English:
        </p>
        <ExampleTable rows={[["Jag äter äpplet.", "I eat the apple."]]} />
        <p>
          But when something <em>other</em> than the subject leads — a time
          expression, a place, an object — the verb still has to stay in second
          position, which means the subject gets pushed after the verb instead:
        </p>
        <ExampleTable
          rows={[
            ["Idag äter jag äpplet.", "Today I eat the apple. (literally: Today eat I the apple.)"],
            ["I skolan lär vi oss svenska.", "At school we learn Swedish."],
          ]}
        />
        <p>
          This &ldquo;inversion&rdquo; is the single most common structural mistake English
          speakers make in Swedish — forgetting to flip the subject and verb after a
          fronted word. It&rsquo;s worth drilling on purpose.
        </p>
      </>
    ),
  },
  {
    slug: "adjective-agreement",
    title: "Adjective agreement",
    summary: "Adjectives change form to match the noun's gender and number.",
    body: (
      <>
        <p>
          Unlike English adjectives, Swedish adjectives change their ending to agree
          with the noun they describe — its gender (en/ett) and whether it&rsquo;s
          singular or plural.
        </p>
        <ExampleTable
          rows={[
            ["en stor bil", "a big car (en-word, base form)"],
            ["ett stort hus", "a big house (ett-word, add -t)"],
            ["stora bilar / hus", "big cars / houses (plural, add -a)"],
          ]}
        />
        <p>
          In the <strong>definite</strong> form (&ldquo;the big car&rdquo;), the adjective
          always takes the <strong>-a</strong> ending regardless of gender, and the
          noun also gets its definite ending: <em>den stora bilen</em>, <em>det
          stora huset</em>.
        </p>
        <p>
          Comparatives and superlatives most often use <em>mer</em> (more) and{" "}
          <em>mest</em> (most), similar to English &ldquo;more interesting&rdquo;/&ldquo;most
          interesting&rdquo; — though many common adjectives have their own short forms
          instead, like <em>stor → större → störst</em> (big → bigger → biggest).
        </p>
      </>
    ),
  },
];

export function getLesson(slug: string) {
  return GRAMMAR_LESSONS.find((l) => l.slug === slug);
}
