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
            <td className="py-1.5 text-muted-foreground">{en}</td>
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
  {
    slug: "word-types",
    title: "Types of words: an overview",
    summary: "The main word classes in Swedish, and how they relate to each other.",
    body: (
      <>
        <p>
          Swedish sorts words into the same basic classes English does, which makes
          this mostly a matter of relabeling rather than learning new concepts from
          scratch. Knowing the class of a word tells you which rules apply to it —
          whether it inflects for gender, tense, or not at all.
        </p>
        <ExampleTable
          rows={[
            ["substantiv", "noun — bil, hus, kärlek (car, house, love)"],
            ["verb", "verb — läsa, vara, springa (to read, to be, to run)"],
            ["adjektiv", "adjective — stor, röd, snäll (big, red, kind)"],
            ["adverb", "adverb — snabbt, ofta, inte (quickly, often, not)"],
            ["pronomen", "pronoun — jag, den, min (I, it, my)"],
            ["preposition", "preposition — i, på, under (in, on, under)"],
            ["konjunktion", "conjunction — och, men, att (and, but, that)"],
            ["räkneord", "numeral — en, två, tredje (one, two, third)"],
          ]}
        />
        <p>
          The classes that change form — nouns, verbs, and adjectives — each have
          their own lesson here (gender and plurals, tense and supine, and
          agreement). The ones that mostly don&rsquo;t change — pronouns aside,
          which still vary by case — are covered in the pronouns, adverbs, and
          connecting-words lessons. One structural note worth internalizing early:
          Swedish has no separate word for &ldquo;a&rdquo;/&ldquo;an&rdquo; — that information is
          baked into whether a noun is an <em>en</em>-word or an <em>ett</em>-word,
          which is why gender shows up so early and so often in this app.
        </p>
      </>
    ),
  },
  {
    slug: "pronouns",
    title: "Pronouns: jag, mig, min",
    summary: "Personal, possessive, and reflexive pronouns — and when each form is used.",
    body: (
      <>
        <p>
          Swedish personal pronouns change form depending on whether they&rsquo;re the
          subject or the object of a verb, similar to English &ldquo;I&rdquo; vs. &ldquo;me.&rdquo;
        </p>
        <ExampleTable
          rows={[
            ["jag / mig", "I / me"],
            ["du / dig", "you / you (singular)"],
            ["han / honom", "he / him"],
            ["hon / henne", "she / her"],
            ["den / det — den / det", "it (en-word) / it (ett-word) — same in both roles"],
            ["vi / oss", "we / us"],
            ["ni / er", "you / you (plural)"],
            ["de / dem", "they / them"],
          ]}
        />
        <p>
          <strong>Possessive pronouns</strong> agree with the noun they modify the
          same way adjectives do (en-word, ett-word, or plural):{" "}
          <em>min bil, mitt hus, mina böcker</em> (my car, my house, my books). This
          three-way split applies to <em>min/mitt/mina</em> (my), <em>din/ditt/dina</em>{" "}
          (your), and <em>vår/vårt/våra</em> (our). The third-person possessives —{" "}
          <em>hans</em> (his), <em>hennes</em> (her/hers), <em>dess</em> (its),{" "}
          <em>deras</em> (their/theirs) — don&rsquo;t change at all.
        </p>
        <p>
          <strong>Reflexive pronouns</strong> are used when the object is the same
          person as the subject. For <em>jag, du, vi, ni</em> this just reuses the
          object pronoun: <em>Jag tvättar mig</em> (I wash myself). But third person
          uses a dedicated word, <strong>sig</strong>, regardless of gender or
          number: <em>Hon tvättar sig</em> (she washes herself), <em>De tvättar sig</em>{" "}
          (they wash themselves) — never <em>henne</em> or <em>dem</em> here, since
          the subject and object are the same person.
        </p>
      </>
    ),
  },
  {
    slug: "adverbs",
    title: "Adverbs and where they go",
    summary: "Adverbs modify verbs and sentences — and often look like an adjective's neuter form.",
    body: (
      <>
        <p>
          An adverb describes how, when, or how much something happens, rather than
          describing a noun. Many Swedish adverbs are formed by taking an
          adjective&rsquo;s <em>ett</em>-form (the one that adds <strong>-t</strong>) and
          using it to modify a verb instead of a noun — the same word, a different
          job.
        </p>
        <ExampleTable
          rows={[
            ["Bilen är snabb. → Han kör snabbt.", "The car is fast. → He drives fast."],
            ["Huset är vackert. → Hon sjunger vackert.", "The house is beautiful. → She sings beautifully."],
          ]}
        />
        <p>
          Other adverbs are their own dedicated words and don&rsquo;t come from
          adjectives at all — these are extremely common and worth memorizing early:{" "}
          <em>inte</em> (not), <em>alltid</em> (always), <em>ofta</em> (often),{" "}
          <em>aldrig</em> (never), <em>bara</em> (just/only), <em>redan</em> (already),{" "}
          <em>mycket</em> (a lot, very), <em>väldigt</em> (very).
        </p>
        <p>
          Placement matters, especially for <strong>inte</strong>. In a main clause it
          goes directly after the finite verb: <em>Jag förstår inte</em> (I don&rsquo;t
          understand), <em>Hon kommer inte imorgon</em> (She&rsquo;s not coming
          tomorrow). In a subordinate clause, it moves to <em>before</em> the verb
          instead: <em>...eftersom jag inte förstår</em> (...because I don&rsquo;t
          understand) — see the connecting-words lesson for why clause type changes
          the word order.
        </p>
      </>
    ),
  },
  {
    slug: "connecting-words",
    title: "Connecting words: och, men, eftersom",
    summary: "Coordinating vs. subordinating conjunctions — and the word-order rule that comes with the second kind.",
    body: (
      <>
        <p>
          Conjunctions join clauses together, but Swedish cares about{" "}
          <em>which kind</em> of conjunction you use, because it changes the word
          order of the clause that follows.
        </p>
        <p>
          <strong>Coordinating conjunctions</strong> join two clauses as equals and
          don&rsquo;t disturb normal V2 word order in either one:
        </p>
        <ExampleTable
          rows={[
            ["och", "and"],
            ["men", "but"],
            ["eller", "or"],
            ["för", "because/for (coordinating — rare, slightly formal)"],
            ["så", "so"],
            ["utan", "but rather (after a negative)"],
          ]}
        />
        <p>
          <strong>Subordinating conjunctions</strong> introduce a clause that depends
          on the main one, and inside that clause the subject must come immediately
          before the verb — no inversion, even if something else leads the clause.
          This is also where sentence adverbials like <em>inte</em> move before the
          verb instead of after it (see the adverbs lesson):
        </p>
        <ExampleTable
          rows={[
            ["att", "that"],
            ["om", "if"],
            ["eftersom / därför att", "because"],
            ["när", "when"],
            ["medan", "while"],
            ["innan", "before"],
            ["fastän / trots att", "even though/despite"],
          ]}
        />
        <ExampleTable
          rows={[
            ["Jag stannar hemma eftersom det regnar.", "I'm staying home because it's raining."],
            ["Hon sa att hon inte kommer.", "She said that she isn't coming."],
          ]}
        />
        <p>
          Notice the main clause (&ldquo;I&rsquo;m staying home&rdquo;, &ldquo;She said&rdquo;) still
          follows the normal V2 rule; it&rsquo;s only inside the subordinate clause
          introduced by the connecting word that the subject-before-verb order is
          fixed and inversion is switched off.
        </p>
      </>
    ),
  },
  {
    slug: "slang",
    title: "Everyday slang and shortcuts",
    summary: "The casual Swedish you'll hear in speech and texting that textbooks skip.",
    body: (
      <>
        <p>
          Spoken and texted Swedish trims and bends standard grammar constantly.
          None of this is &ldquo;wrong&rdquo; — it&rsquo;s just not what you&rsquo;d write in a formal
          text, which is why the reader&rsquo;s generated texts mostly avoid it, but
          you&rsquo;ll hit it immediately in real conversation.
        </p>
        <ExampleTable
          rows={[
            ["typ", "like / kind of (filler, exactly like English \"typ är det kul\" = \"it's like, fun\")"],
            ["kul / grymt / najs", "fun / awesome / nice (grymt and najs are both casual intensifiers)"],
            ["schysst", "decent, nice, fair (\"that's a decent price\", \"he's a nice guy\")"],
            ["fett", "literally \"fat\" — slang for \"really/very\": fett bra = really good"],
            ["kolla", "to look/check: kolla här = look here, check this out"],
            ["chilla", "to chill, relax — a direct English loanword"],
            ["funkar", "works/is fine: funkar för mig = works for me"],
            ["fan / jävlar", "mild-to-strong swear, roughly \"damn/hell\" — common but not polite company"],
          ]}
        />
        <p>
          Pronunciation-driven spelling shortcuts are everywhere in texting:{" "}
          <em>dom</em> replaces both <em>de</em> and <em>dem</em> in speech and
          casual writing (they/them collapse into one sound), <em>nåt</em> or{" "}
          <em>nått</em> stands in for <em>något</em> (something), and <em>sa</em> is
          the everyday past tense of <em>säga</em> (to say) that you&rsquo;ll hear far
          more than the fuller written forms.
        </p>
        <p>
          A good rule of thumb: if a generated text or dictionary lookup gives you
          the &ldquo;proper&rdquo; form, that&rsquo;s what to learn first — slang is easier to
          pick up by ear once the underlying word is already familiar.
        </p>
      </>
    ),
  },
  {
    slug: "idioms-and-phrases",
    title: "Idioms and popular phrases",
    summary: "Fixed expressions that don't translate word-for-word — including Swedish's own \"cat got your tongue.\"",
    body: (
      <>
        <p>
          Every language has sayings that make no sense translated literally.
          Swedish has an English equivalent for almost every situation — just with
          its own imagery.
        </p>
        <ExampleTable
          rows={[
            ["Har du tappat tungan?", "\"Cat got your tongue?\" (literally: \"Did you lose your tongue?\")"],
            ["Ingen ko på isen.", "No rush, no worries. (literally: \"No cow on the ice.\")"],
            ["Det ligger en hund begraven här.", "Something fishy is going on. (literally: \"There's a dog buried here.\")"],
            ["Köpa grisen i säcken.", "To buy a pig in a poke — buy something sight unseen."],
            ["Få skägget i brevlådan.", "To get caught out / end up in an awkward spot. (literally: \"to get your beard in the mailbox\")"],
            ["Glad som en lärka.", "Happy as a lark."],
            ["Smaken är som baken — delad.", "Tastes differ. (literally: \"Taste is like the backside — divided,\" a pun since \"delad bak\" also means a cleft behind)"],
            ["Det var som attan!", "Well, I'll be darned! (mild exclamation of surprise)"],
          ]}
        />
        <p>
          These are worth recognizing more than producing at first — when a native
          speaker drops one into conversation, the literal words will mislead you if
          you try to translate them directly. Look them up the same way you would
          any other vocabulary: the dictionary lookup in the reader works on single
          words, so for idioms it&rsquo;s more useful to recognize the whole phrase as a
          unit than to look up &ldquo;ko&rdquo; (cow) and &ldquo;is&rdquo; (ice) separately and wonder
          why they don&rsquo;t add up to &ldquo;no rush.&rdquo;
        </p>
      </>
    ),
  },
  {
    slug: "phrasal-verbs",
    title: "Phrasal verbs (partikelverb)",
    summary: "Verb + particle combinations that create a brand new meaning — ta bort, ge upp, slå på.",
    body: (
      <>
        <p>
          Just like English &ldquo;give up,&rdquo; &ldquo;turn on,&rdquo; and &ldquo;look after&rdquo; mean
          something very different from &ldquo;give,&rdquo; &ldquo;turn,&rdquo; and &ldquo;look&rdquo; alone,
          Swedish has its own set of verb-plus-particle combinations called{" "}
          <strong>partikelverb</strong>. The particle — usually a short word that
          also works as a preposition or adverb on its own — attaches to a verb
          and shifts its meaning, sometimes completely.
        </p>
        <ExampleTable
          rows={[
            ["ta bort", "to remove (ta = to take, bort = away)"],
            ["ge upp", "to give up"],
            ["slå på / stänga av", "to turn on / to turn off"],
            ["komma på", "to come up with / to realize"],
            ["komma ihåg", "to remember"],
            ["sätta igång", "to get going, to start"],
            ["lägga till", "to add"],
            ["ta på / ta av", "to put on / to take off (clothes)"],
          ]}
        />
        <p>
          A useful test for spotting a true partikelverb: the particle carries
          its own stress, almost as heavy as the verb itself —{" "}
          <em>ta&nbsp;BORT</em>, not <em>TA&nbsp;bort</em>. Compare that with a verb
          that simply happens to be followed by a preposition, like{" "}
          <em>tänka på</em> (to think about) or <em>vänta på</em> (to wait for):
          there the stress stays on the verb, and the meaning is a fairly
          predictable combination of the two words rather than something new.
        </p>
        <p>
          Word order gets specific when the object is a pronoun rather than a
          full noun: a pronoun object goes <em>between</em> the verb and the
          particle, while a noun object can go either between them or after the
          particle:
        </p>
        <ExampleTable
          rows={[
            ["Ta bort filen. / Ta filen bort.", "Remove the file. (noun object — either order)"],
            ["Ta bort den.", "Remove it. (pronoun object — must go between verb and particle)"],
            ["Jag kom på det igår.", "I thought of it yesterday. (pronoun \"det\" before the particle \"på\")"],
          ]}
        />
        <p>
          This is also why the dictionary lookup in the reader shows a verb&rsquo;s
          bare infinitive, present, past, supine, and imperative forms —
          partikelverb conjugate exactly like their base verb does (<em>ta</em>{" "}
          → <em>tar</em> → <em>tog</em> → <em>tagit</em>), with the particle simply
          riding along unchanged.
        </p>
      </>
    ),
  },
];

export function getLesson(slug: string) {
  return GRAMMAR_LESSONS.find((l) => l.slug === slug);
}
