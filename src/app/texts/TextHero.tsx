"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tessera/ui";
import AddTextForm from "./AddTextForm";
import GenerateTextForm from "./GenerateTextForm";

export default function TextHero({ guest = false }: { guest?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <section className="border border-accent/30 bg-linear-to-br from-accent/15 via-accent/5 to-transparent px-5 py-6 sm:px-8 sm:py-8">
        <h2 className="font-serif text-lg font-semibold sm:text-xl">Generate a new text</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Pick a level and an optional topic — we&rsquo;ll write a short Swedish text for you to read.
        </p>
        <GenerateTextForm guest={guest} />
      </section>
      <div className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
        <span>Or bring your own:</span>
        <Dialog>
          <DialogTrigger render={<Button variant="link" color="neutral" size="sm" className="px-1" />}>
            Paste your own text
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paste your own text</DialogTitle>
              <DialogDescription>Add any Swedish text you want to read and study.</DialogDescription>
            </DialogHeader>
            <AddTextForm guest={guest} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
