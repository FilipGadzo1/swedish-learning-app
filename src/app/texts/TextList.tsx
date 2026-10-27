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
      <Card className="rounded-none px-4 py-6 text-center text-sm text-muted-foreground">
        No texts yet — add one on the right to get started.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {texts.map((t) => (
        <Card
          key={t.id}
          className="rounded-none flex-row items-center justify-between gap-3 px-4 py-3"
        >
          <Link href={`/texts/${t.id}`} className="font-medium hover:text-accent">
            {t.title}
          </Link>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{t.source}</Badge>
            {t.level && <Badge variant="outline">{t.level}</Badge>}
          </div>
        </Card>
      ))}
    </div>
  );
}
