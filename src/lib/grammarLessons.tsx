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
        <p>
          <strong>Compound nouns</strong> take the gender of their <em>last</em>{" "}
          component, regardless of what the earlier parts are. This is a genuinely
          reliable rule, unlike guessing gender from scratch: <em>ett brev</em>{" "}
          (a letter) + <em>en låda</em> (a box) → <em>en brevlåda</em> (a mailbox) is
          an en-word because <em>låda</em>, the last part, is an en-word.
        </p>
        <ExampleTable
          rows={[
            ["ett bord + en lampa → en bordslampa", "a table + a lamp → a table lamp (en, from lampa)"],
            ["en sol + ett sken → ett solsken", "a sun + a glow → sunshine (ett, from sken)"],
          ]}
        />
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
        <p>
          There&rsquo;s a second way to say &ldquo;the&rdquo; that shows up as soon as an{" "}
          <strong>adjective</strong> comes before the noun: you still add the suffix,
          but you also add a free-standing word in front — <em>den</em> for en-words,{" "}
          <em>det</em> for ett-words, <em>de</em> for all plurals. English speakers
          often drop this &ldquo;double definiteness&rdquo; out of habit, but Swedish keeps
          both pieces:
        </p>
        <ExampleTable
          rows={[
            ["den stora bilen", "the big car (not stora bilen)"],
            ["det gamla huset", "the old house"],
            ["de röda äpplena", "the red apples"],
          ]}
        />
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
        <p>
          That&rsquo;s the fifth pattern promised above — <strong>-er</strong>, mostly on
          nouns borrowed from Latin/Greek. Beyond these five patterns, a small set
          of very common nouns are outright irregular on top of that, with a vowel
          change instead of (or alongside) an ending — these just have to be
          memorized individually, the same way English &ldquo;man → men&rdquo; and &ldquo;foot →
          feet&rdquo; do:
        </p>
        <ExampleTable
          rows={[
            ["ett museum → museer", "a museum → museums (-er)"],
            ["en man → män", "a man → men (vowel change, no ending)"],
            ["en bror → bröder", "a brother → brothers (vowel change + -er)"],
            ["en bok → böcker", "a book → books (vowel change + -er)"],
          ]}
        />
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
        <p>
          <strong>Modal verbs</strong> — <em>kan</em> (can), <em>vill</em> (want to),{" "}
          <em>måste</em> (must), <em>ska</em> (will/going to), <em>får</em> (may/is
          allowed to) — follow the same one-form rule and pair directly with a
          second verb&rsquo;s infinitive, no &ldquo;to&rdquo; needed: <em>Jag vill läsa</em> (I
          want to read), <em>Hon kan simma</em> (She can swim).
        </p>
        <p>
          One form worth separating from present tense even though it looks
          similar: the <strong>imperative</strong> (a command) is usually just the
          verb&rsquo;s bare stem, not the present-tense form — <em>Läs!</em> (Read!), not{" "}
          <em>Läser!</em>. For -ar verbs the stem and the infinitive are the same:{" "}
          <em>Tala!</em> (Speak!).
        </p>
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
        <p>
          There&rsquo;s a third past form for when you need to talk about &ldquo;a past
          before a past&rdquo; — the <strong>pluperfect</strong>, formed with{" "}
          <em>hade</em> (had) instead of <em>har</em>, plus the same supine:{" "}
          <em>Jag hade redan läst boken när filmen kom ut</em> (I had already read
          the book when the movie came out). It works exactly like English &ldquo;had +
          past participle,&rdquo; just with the supine standing in for the participle.
        </p>
      </>
    ),
  },
  {
    slug: "future-tense",
    title: "Future tense",
    summary: "Talking about what will happen: ska, kommer att, and the plain present.",
    body: (
      <>
        <p>
          Swedish has no dedicated future verb ending. Instead, the future is built
          with a helper verb plus the <strong>infinitive</strong>, or sometimes just
          the present tense.
        </p>
        <p>
          <strong>ska + infinitive</strong> expresses intention or a plan, like
          English &ldquo;am going to&rdquo;: <em>Jag ska läsa boken</em> (I&rsquo;m going to read
          the book).
        </p>
        <p>
          <strong>kommer att + infinitive</strong> is a more neutral prediction of
          what will happen, often outside the speaker&rsquo;s control: <em>Det kommer att
          regna</em> (It will rain).
        </p>
        <ExampleTable
          rows={[
            ["Jag ska äta middag.", "I'm going to eat dinner."],
            ["Hon kommer att komma sent.", "She will come late."],
            ["Vi ska resa till Sverige.", "We're going to travel to Sweden."],
            ["Det kommer att bli kallt.", "It's going to get cold."],
          ]}
        />
        <p>
          The <strong>present tense</strong> also works for the future, especially
          with a time expression, just like English &ldquo;I&rsquo;m leaving tomorrow&rdquo;:{" "}
          <em>Jag åker imorgon</em> (I&rsquo;m leaving tomorrow).
        </p>
        <p>
          This is why the reader&rsquo;s verb panel shows a <em>Future</em> row: the
          infinitive is all you need, with <em>ska</em> or <em>kommer att</em> in
          front of it.
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
        <p>
          Questions use the same inversion instinct, just starting from the verb
          itself. A yes/no question puts the verb first, before the subject:{" "}
          <em>Äter du äpplet?</em> (Are you eating the apple?). A question starting
          with a question word (<em>vad, var, vem</em>...) puts that word first,
          then still inverts verb and subject right after it — see the &ldquo;asking
          questions&rdquo; lesson for the full set of question words and how they
          combine with this pattern.
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
        <p>
          A handful of very common adjectives are irregular enough to just
          memorize outright, the way English &ldquo;good → better → best&rdquo; is. The most
          important one is <em>liten</em> (small), which changes almost
          unrecognizably depending on gender, number, and definiteness:
        </p>
        <ExampleTable
          rows={[
            ["en liten bil", "a small car (en-word)"],
            ["ett litet hus", "a small house (ett-word)"],
            ["lilla bilen / lilla huset", "the small car / house (definite singular)"],
            ["små bilar / hus", "small cars / houses (plural, any gender)"],
          ]}
        />
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
        <p>
          Two more classes round out the picture, both small closed sets rather
          than something you&rsquo;ll keep adding to:{" "}
          <strong>interjektion</strong> (interjection) covers exclamations like{" "}
          <em>oj!</em> (oops!), <em>usch!</em> (ugh!), and <em>aj!</em> (ouch!); and{" "}
          <strong>artikel</strong> (article) is sometimes used as a separate label
          for the free-standing <em>den/det/de</em> that shows up before an
          adjective + definite noun (see the definite-forms lesson) — some
          grammars count it as its own class, others fold it into pronouns.
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
        <p>
          Two more useful sets round out pronouns. <strong>Demonstratives</strong> —
          &ldquo;this/these&rdquo; and &ldquo;that/those&rdquo; — add <em>här</em> (here) or{" "}
          <em>där</em> (there) after the gendered article: <em>den här bilen</em>{" "}
          (this car), <em>det där huset</em> (that house), <em>de här böckerna</em>{" "}
          (these books). <strong>Indefinite pronouns</strong> follow the same
          en/ett/plural three-way split you&rsquo;ve already seen for possessives:{" "}
          <em>någon/något/några</em> (some/any), <em>ingen/inget/inga</em>{" "}
          (no/none).
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
        <p>
          Adverbs compare the same way adjectives do, usually with <em>mer</em>/
          <em>mest</em> but sometimes with a short form:{" "}
          <em>snabbt → snabbare → snabbast</em> (fast → faster → fastest). And
          placement for time/place adverbs is more flexible than for{" "}
          <em>inte</em> — they typically go at the very start or the very end of
          the clause rather than glued to the verb: <em>Igår regnade det</em> /{" "}
          <em>Det regnade igår</em> (It rained yesterday), both fine.
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
        <p>
          A few more conjunctions are worth having ready: <em>så att</em> (so
          that — subordinating, triggers the fixed word order above),{" "}
          <em>antingen...eller</em> (either...or), and <em>varken...eller</em>{" "}
          (neither...nor) — both of the last two are coordinating and come as a
          matched pair: <em>Jag vill varken äta eller dricka</em> (I want neither
          to eat nor to drink).
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
        <ExampleTable
          rows={[
            ["keff", "lame, low-quality: en keff present = a lame gift"],
            ["grymt bra / asgrymt", "really great — \"as-\" is a casual intensifier prefix, like \"super-\""],
            ["pucko / dumskalle", "idiot, dummy — mild, joking insults between friends"],
            ["sjukt", "literally \"sick/ill\" — slang intensifier: sjukt kul = insanely fun"],
          ]}
        />
      </>
    ),
  },
  {
    slug: "idioms-and-phrases",
    title: "Idioms and popular phrases",
    summary: "Fixed expressions that don't translate word-for-word.",
    body: (
      <>
        <p>
          Every language has sayings that make no sense translated literally.
          Swedish has an English equivalent for almost every situation — just with
          its own imagery.
        </p>
        <ExampleTable
          rows={[
            ["Har du tappat tungan?", "Did you lose your tongue? — a joking way to ask why someone's gone quiet."],
            ["Ingen ko på isen.", "No rush, no worries. (literally: \"No cow on the ice.\")"],
            ["Det ligger en hund begraven här.", "Something fishy is going on. (literally: \"There's a dog buried here.\")"],
            ["Köpa grisen i säcken.", "To buy a pig in a poke — buy something sight unseen."],
            ["Få skägget i brevlådan.", "To get caught out / end up in an awkward spot. (literally: \"to get your beard in the mailbox\")"],
            ["Glad som en lärka.", "Happy as a lark."],
            ["Smaken är som baken — delad.", "Tastes differ. (literally: \"Taste is like the backside — divided,\" a pun since \"delad bak\" also means a cleft behind)"],
            ["Det var som attan!", "Well, I'll be darned! (mild exclamation of surprise)"],
            ["Att kasta pengarna i sjön.", "To throw money away. (literally: \"to throw the money in the lake\")"],
            ["Nu är det kokta fläsket stekt.", "Now things have gone badly wrong. (literally: \"now the boiled pork is fried\" — pork that's already boiled and then fried is ruined)"],
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
            ["lägga ner", "to shut down / give up on (ett företag lägger ner = a company shuts down)"],
            ["skriva ner", "to write down"],
            ["hoppa över", "to skip (a meal, a step, a chapter)"],
            ["ringa upp", "to call back / phone someone up"],
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
  {
    slug: "wh-questions",
    title: "Asking questions: vad, vem, var, när",
    summary: "Swedish question words, and the word order that comes with them.",
    body: (
      <>
        <p>
          Swedish question words work much like English &ldquo;wh-&rdquo; words, and most of
          them are a single, memorable syllable:
        </p>
        <ExampleTable
          rows={[
            ["vad", "what"],
            ["vem / vilka", "who (singular) / who (plural)"],
            ["vilken / vilket / vilka", "which (en-word / ett-word / plural)"],
            ["var", "where"],
            ["vart", "where to (motion toward a place, not just location)"],
            ["när", "when"],
            ["varför", "why"],
            ["hur", "how"],
            ["hur mycket / hur många", "how much / how many (countable vs. uncountable)"],
          ]}
        />
        <p>
          The question word always leads the sentence, and just like a fronted
          time or place expression in a statement (see the word-order lesson), the
          verb comes immediately after it, before the subject:
        </p>
        <ExampleTable
          rows={[
            ["Vad heter du?", "What is your name? (literally: What are you called?)"],
            ["Var bor du?", "Where do you live?"],
            ["Vart ska du?", "Where are you going?"],
            ["När kommer bussen?", "When is the bus coming?"],
            ["Varför gråter hon?", "Why is she crying?"],
            ["Hur mår du?", "How are you? (literally: How do you feel?)"],
          ]}
        />
        <p>
          <strong>Var</strong> vs. <strong>vart</strong> trips up a lot of
          learners: <em>var</em> asks about a static location (&ldquo;where are you&rdquo;),
          while <em>vart</em> asks about a destination, used with verbs of motion
          (&ldquo;where are you going&rdquo;). English collapses both into &ldquo;where,&rdquo; so this
          distinction has to be learned on purpose.
        </p>
        <p>
          <strong>Vilken/vilket/vilka</strong> agree with the noun they ask about
          the same way adjectives and demonstratives do — en-word, ett-word, or
          plural: <em>Vilken bil?</em> (Which car?), <em>Vilket hus?</em> (Which
          house?), <em>Vilka böcker?</em> (Which books?).
        </p>
        <p>
          For a yes/no question with no question word at all, the verb simply
          moves to the very front, ahead of the subject: <em>Kommer du imorgon?</em>{" "}
          (Are you coming tomorrow?) — there&rsquo;s no equivalent of English &ldquo;do&rdquo; as
          a helper word; the main verb itself does the inverting.
        </p>
      </>
    ),
  },
  {
    slug: "numbers",
    title: "Numbers: ett, två, tre",
    summary: "Cardinal and ordinal numbers — and why \"one\" is the same word as the gender article.",
    body: (
      <>
        <p>
          Swedish numbers are mostly straightforward to learn by rote, but one
          is already familiar: <strong>ett</strong> (one) is the exact same word
          as the <em>ett</em>-word article you already know from the gender
          lesson, and <strong>en</strong> (one) is the same as the <em>en</em>-word
          article. When you count a noun, the word for &ldquo;one&rdquo; still has to
          agree with that noun&rsquo;s gender: <em>en bil</em> (one/a car),{" "}
          <em>ett hus</em> (one/a house) — not a coincidence, it&rsquo;s literally
          the same grammatical agreement at work.
        </p>
        <ExampleTable
          rows={[
            ["noll, en/ett, två, tre, fyra, fem", "0, 1, 2, 3, 4, 5"],
            ["sex, sju, åtta, nio, tio", "6, 7, 8, 9, 10"],
            ["elva, tolv, tretton, fjorton, femton", "11, 12, 13, 14, 15"],
            ["sexton, sjutton, arton, nitton, tjugo", "16, 17, 18, 19, 20"],
          ]}
        />
        <p>
          From 21 onward, Swedish just glues the pieces together as one word,
          with no &ldquo;and&rdquo; the way some languages use: <em>tjugoett</em>{" "}
          (twenty-one), <em>tjugotvå</em> (twenty-two). The tens follow a
          regular <strong>-tio</strong> pattern from 30 up:
        </p>
        <ExampleTable
          rows={[
            ["trettio, fyrtio, femtio", "30, 40, 50"],
            ["sextio, sjuttio, åttio, nittio", "60, 70, 80, 90"],
            ["hundra, tvåhundra", "100, 200"],
            ["tusen, tvåtusen", "1,000, 2,000"],
          ]}
        />
        <p>
          <strong>Ordinal numbers</strong> (first, second, third...) are a
          separate set of words, not just &ldquo;number + -th&rdquo; the way English
          mostly works, and the first few are irregular:
        </p>
        <ExampleTable
          rows={[
            ["första, andra, tredje", "1st, 2nd, 3rd"],
            ["fjärde, femte, sjätte", "4th, 5th, 6th"],
            ["sjunde, åttonde, nionde, tionde", "7th, 8th, 9th, 10th"],
          ]}
        />
        <p>
          From 11th onward it regularizes to <strong>-de</strong> or{" "}
          <strong>-e</strong> tacked onto the cardinal number (
          <em>elfte</em>, <em>tolfte</em>, <em>tjugonde</em>), which is also the
          form used for dates — see the next lesson.
        </p>
      </>
    ),
  },
  {
    slug: "time-dates-seasons",
    title: "Days, dates, and seasons",
    summary: "Veckodagar, månader, and årstider — the vocabulary that anchors a text in time.",
    body: (
      <>
        <p>
          Days of the week (<strong>veckodagar</strong>) all end in{" "}
          <strong>-dag</strong>, and the week starts on Monday, not Sunday:
        </p>
        <ExampleTable
          rows={[
            ["måndag, tisdag, onsdag", "Monday, Tuesday, Wednesday"],
            ["torsdag, fredag", "Thursday, Friday"],
            ["lördag, söndag", "Saturday, Sunday"],
          ]}
        />
        <p>
          Months (<strong>månader</strong>) are close enough to English/Latin
          roots that they&rsquo;re mostly recognizable on sight, and — like all
          Swedish nouns that aren&rsquo;t proper names of people or places — they&rsquo;re
          written lowercase, not capitalized the way English does:
        </p>
        <ExampleTable
          rows={[
            ["januari, februari, mars, april", "January, February, March, April"],
            ["maj, juni, juli, augusti", "May, June, July, August"],
            ["september, oktober, november, december", "September, October, November, December"],
          ]}
        />
        <p>
          A <strong>date</strong> uses the ordinal number from the numbers
          lesson plus the month: <em>den femte maj</em> (the fifth of May,
          literally &ldquo;the fifth May&rdquo;). <em>Den</em> here works the same
          free-standing-article role you saw in the definite-forms lesson.
        </p>
        <ExampleTable
          rows={[
            ["Vilket datum är det idag?", "What's the date today?"],
            ["Det är den femte maj.", "It's the fifth of May."],
            ["Jag föddes den tjugoförsta mars.", "I was born on the 21st of March."],
          ]}
        />
        <p>
          The four seasons (<strong>årstider</strong>) are all common everyday
          words, worth knowing early since they show up constantly in weather
          talk and generated texts about daily life:
        </p>
        <ExampleTable
          rows={[
            ["vår", "spring"],
            ["sommar", "summer"],
            ["höst", "autumn/fall"],
            ["vinter", "winter"],
          ]}
        />
        <p>
          To say &ldquo;in&rdquo; a season, Swedish uses <strong>på</strong> plus the
          season&rsquo;s definite form, and this works for all four — it&rsquo;s the safe,
          always-correct default: <em>på våren</em> (in spring), <em>på sommaren</em>{" "}
          (in summer), <em>på hösten</em> (in autumn), <em>på vintern</em> (in
          winter). Swedish keeps the definite form here even though English
          drops &ldquo;the&rdquo; in casual speech (&ldquo;in summer,&rdquo; not &ldquo;in the summer&rdquo;).
        </p>
        <p>
          You&rsquo;ll also hear <strong>om</strong> plus the definite form, most often
          with <em>sommaren</em> and <em>vintern</em>: <em>om sommaren</em>,{" "}
          <em>om vintern</em>. This isn&rsquo;t a different season pairing — it&rsquo;s a
          different nuance, leaning toward a habitual or recurring statement
          (&ldquo;in winter(s), generally...&rdquo;) rather than one specific season.
          When in doubt, <em>på</em> is never wrong.
        </p>
      </>
    ),
  },
];

export function getLesson(slug: string) {
  return GRAMMAR_LESSONS.find((l) => l.slug === slug);
}
