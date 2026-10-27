import Link from "next/link";
import { Badge, Card } from "@tessera/ui";

export type TextListItem = {
  id: string;
  title: string;
  source: string;
  level: string | null;
};

export default function TextList({ texts }: { texts: TextListItem[] }) {
  if (texts.length === 0) {
    return (
      <Card className="mt-6 px-4 py-6 text-center text-sm text-muted-foreground">
        No texts yet — paste one above to get started.
      </Card>
    );
  }

  return (
    <Card className="mt-6 divide-y divide-border p-0">
      {texts.map((t) => (
        <div key={t.id} className="flex items-center justify-between px-4 py-3">
          <Link href={`/texts/${t.id}`} className="font-medium hover:text-accent">
            {t.title}
          </Link>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{t.source}</Badge>
            {t.level && <Badge variant="outline">{t.level}</Badge>}
          </div>
        </div>
      ))}
    </Card>
  );
}
