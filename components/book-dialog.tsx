"use client";

/**
 * The add/edit book form, shown in a dialog from the home page.
 *
 * The same form serves both jobs: `book` null means add, non-null means edit. The inner form is
 * keyed by the book's id, so its fields start from the right values every time the dialog opens.
 */
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addBook, updateBook, type BookInput } from "@/lib/data/books";
import type { Book } from "@/lib/db";

export type BookDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The book being edited, or null to add a new one. */
  book: Book | null;
};

export function BookDialog({ open, onOpenChange, book }: BookDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{book ? "Edit book" : "Add a book"}</DialogTitle>
          <DialogDescription>
            {book
              ? "Change any of the details, or say you have read it."
              : "What is it, who wrote it, and why do you want to read it?"}
          </DialogDescription>
        </DialogHeader>
        <BookForm
          key={book?.id ?? "new"}
          book={book}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function BookForm({ book, onDone }: { book: Book | null; onDone: () => void }) {
  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [note, setNote] = useState(book?.note ?? "");
  const [done, setDone] = useState(book?.done ?? false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setTitleError("Give the book a title.");
      return;
    }
    const input: BookInput = { title: title.trim(), author: author.trim(), note: note.trim() };
    setSaving(true);
    try {
      if (book) {
        await updateBook(book.id, input);
        if (done !== book.done) await setBookDone(book.id, done);
        toast.success(`Saved “${input.title}”.`);
      } else {
        await addBook(input);
        if (done) {
          // Added from the edit shape of the form, where the read box is offered.
          const added = await addBook(input).catch(() => null);
          if (added) await setBookDone(added.id, true);
        }
        toast.success(`Added “${input.title}” to your list.`);
      }
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. The book was not saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="book-title">Title</Label>
        <Input
          id="book-title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError) setTitleError(null);
          }}
          placeholder="The Left Hand of Darkness"
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "book-title-error" : undefined}
          autoFocus
        />
        {titleError && (
          <p id="book-title-error" role="alert" className="text-sm text-destructive">
            {titleError}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="book-author">Author</Label>
        <Input
          id="book-author"
          name="author"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Ursula K. Le Guin"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="book-note">Why I want to read it</Label>
        <Textarea
          id="book-note"
          name="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Recommended for the winter chapters…"
          rows={3}
        />
      </div>
      {book && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="book-done"
            checked={done}
            onCheckedChange={(checked) => setDone(checked === true)}
          />
          <Label htmlFor="book-done" className="font-normal">
            I have read this book
          </Label>
        </div>
      )}
      <DialogFooter className="mt-1">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving…" : book ? "Save changes" : "Save book"}
        </Button>
      </DialogFooter>
    </form>
  );
}