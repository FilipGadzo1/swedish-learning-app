import { redirect } from "next/navigation";

// Always redirects — not meaningfully prerenderable.
export const instant = false;

export default function Home() {
  redirect("/texts");
}
