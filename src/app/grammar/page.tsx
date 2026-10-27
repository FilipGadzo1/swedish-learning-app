import { redirect } from "next/navigation";
import { GRAMMAR_LESSONS } from "@/lib/grammarLessons";

// Always redirects — not meaningfully prerenderable.
export const instant = false;

export default function GrammarIndexPage() {
  redirect(`/grammar/${GRAMMAR_LESSONS[0].slug}`);
}
