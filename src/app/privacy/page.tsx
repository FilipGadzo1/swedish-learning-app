import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Svenska",
};

// Shown on the page as the address for access/deletion requests.
const CONTACT_EMAIL = "filip.gadzo123@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6 text-sm leading-relaxed">
      <div>
        <h1 className="font-serif text-xl font-semibold">Privacy</h1>
        <p className="text-muted-foreground">
          Svenska is a small personal project. This page says what it stores and who it shares
          data with.
        </p>
      </div>

      <Section title="What we store">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>If you sign in with Google:</strong> your account email and a user ID, plus
            the texts you add or generate, your highlights and notes, your saved words with their
            review schedule, and which grammar lessons you&rsquo;ve read.
          </li>
          <li>
            <strong>If you continue as a guest:</strong> the same kind of data, but it stays only
            in your browser (local storage). It is never sent to an account and is lost if you
            clear site data.
          </li>
        </ul>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          Everything here is needed for the app to work, so there is no cookie banner.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Sign-in cookies (from Supabase) keep you logged in.</li>
          <li>A <code>guestMode</code> cookie remembers that you chose to continue as a guest.</li>
          <li>
            Local storage holds your settings (theme, accent colour, effects, voice) and, in guest
            mode, your texts and words.
          </li>
        </ul>
        <p>
          We use Vercel Web Analytics to count page views. It does not use cookies or follow you
          across other sites.
        </p>
      </Section>

      <Section title="Who else sees your data">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Anthropic (Claude):</strong> words you look up and the topic or text you ask
            to generate are sent to produce dictionary entries and practice texts.
          </li>
          <li>
            <strong>ElevenLabs:</strong> text you ask to hear read aloud is sent to produce the
            audio.
          </li>
          <li>
            <strong>Supabase:</strong> hosts the database and sign-in for signed-in accounts.
          </li>
          <li>
            <strong>Google:</strong> handles the &ldquo;Sign in with Google&rdquo; step.
          </li>
          <li>
            <strong>Vercel:</strong> hosts the app and provides the page-view analytics.
          </li>
        </ul>
        <p>
          Dictionary entries are cached and shared between users so repeat lookups are fast. They
          contain the word&rsquo;s dictionary information only, not anything about you.
        </p>
        <p>We don&rsquo;t sell your data or use it for advertising.</p>
      </Section>

      <Section title="Your choices">
        <p>
          You can delete any text from the Texts page. To see, export or delete your account and
          all its data, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          . Guest data can be removed any time by clearing this site&rsquo;s data in your browser.
        </p>
      </Section>

      <Link href="/login" className="text-accent hover:underline">
        Back to sign in
      </Link>
    </main>
  );
}
