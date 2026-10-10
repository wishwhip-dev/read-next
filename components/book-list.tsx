"use client";

/**
 * The whole home-page experience: the readout, the list of books to read, the done section at the
 * bottom, the add/edit dialog and the delete confirmation.
 *
 * Data comes from a live query over Dexie, so a write anywhere updates the readout and the rows
 * the moment it lands — no manual refetch, no stale counts.
 */
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookDialog } from "@/components/book-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { deleteBook, listBooks, setBookDone } from "@/lib/data/books";
import type { Book } from "@/lib/db";
import { database } from "@/lib/db";
import { useStorageStatus, useStoredQuery } from "@/lib/storage/react";

export function BookList() {
  const { data, isLoading } = useStoredQuery(database, listBooks);
  const storageStatus = useStorageStatus(database);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null);

  const books = data ?? [];
  const toRead = books.filter((book) => !book.done);
  const read = books.filter((book) => book.done);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setDialogOpen(true);
  }

  async function toggleDone(book: Book, done: boolean) {
    try {
      await setBookDone(book.id, done);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The read state could not be saved.");
    }
  }

  async function confirmDelete() {
    const book = pendingDelete;
    if (!book) return;
    try {
      await deleteBook(book.id);
      toast.success(`Deleted “${book.title}”.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The book could not be deleted.");
    }
  }

  return (
    <div className="grid gap-6">
      {storageStatus === "memory" && (
        <Alert>
          <AlertTitle>This browser will not keep your list</AlertTitle>
          <AlertDescription>
            Storage is unavailable here, so the list lives in memory for this visit only. Export it
            from Settings before you close the tab.
          </AlertDescription>
        </Alert>
      )}

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My reading list</h1>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {isLoading ? "Loading your list…" : `${read.length} of ${books.length} read`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/settings">Settings</Link>
          </Button>
          <Button onClick={openAdd} className="min-h-11">
            Add book
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyList onAdd={openAdd} />
      ) : (
        <>
          {toRead.length > 0 ? (
            <ul className="grid gap-3">
              {toRead.map((book) => (
                <BookRow
                  key={book.id}
                  book={book}
                  onToggle={(done) => toggleDone(book, done)}
                  onEdit={() => openEdit(book)}
                  onDelete={() => setPendingDelete(book)}
                />
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              You have read everything on your list. Time to add the next one.
            </p>
          )}

          {read.length > 0 && (
            <section aria-labelledby="done-heading" className="grid gap-3">
              <h2 id="done-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Done ({read.length})
              </h2>
              <ul className="grid gap-3">
                {read.map((book) => (
                  <BookRow
                    key={book.id}
                    book={book}
                    onToggle={(done) => toggleDone(book, done)}
                    onEdit={() => openEdit(book)}
                    onDelete={() => setPendingDelete(book)}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <BookDialog open={dialogOpen} onOpenChange={setDialogOpen} book={editing} />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete “{pendingDelete?.title}”?</DialogTitle>
            <DialogDescription>
              This removes the book and its note from your list. You cannot get it back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="min-h-11" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
            <Button variant="destructive" className="min-h-11" onClick={confirmDelete}>
              Delete book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyList({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-8 text-center">
      <h2 className="text-lg font-semibold">Nothing on your list yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Add the first book you want to read, with a line on why — the list waits here, in this
        browser, until you come back to it.
      </p>
      <Button onClick={onAdd} className="mt-4 min-h-11">
        Add your first book
      </Button>
    </div>
  );
}

function BookRow({
  book,
  onToggle,
  onEdit,
  onDelete,
}: {
  book: Book;
  onToggle: (done: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const checkboxId = `book-done-${book.id}`;
  return (
    <li className="flex items-start gap-1 rounded-lg border bg-card p-3 sm:gap-2 sm:p-4">
      <label htmlFor={checkboxId} className="-m-1 cursor-pointer p-1">
        <Checkbox
          id={checkboxId}
          className="mt-1 size-6"
          checked={book.done}
          onCheckedChange={(checked) => onToggle(checked === true)}
          aria-label={`Mark “${book.title}” as ${book.done ? "not read" : "read"}`}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className={`break-words font-medium leading-snug ${book.done ? "text-muted-foreground line-through" : ""}`}>
          {book.title}
        </p>
        {book.author && (
          <p className="break-words text-sm text-muted-foreground">by {book.author}</p>
        )}
        {book.note && <p className="mt-1 break-words text-sm leading-snug">{book.note}</p>}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="min-h-11 px-3" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="outline"
          className="min-h-11 px-3 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}