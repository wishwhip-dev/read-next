/**
 * Everything the UI does to the books table. Components call these, never Dexie directly.
 */
import { database, newId, type Book } from "@/lib/db";

const books = async () => (await database.ready()).books;

/** Every book, newest first. The screen splits it into unread and done. */
export async function listBooks(): Promise<Book[]> {
  return (await books()).orderBy("createdAt").reverse().toArray();
}

/** The fields a person can set on a book. `done` comes only from the checkbox. */
export type BookInput = {
  title: string;
  author: string;
  note: string;
};

export async function addBook(input: BookInput): Promise<Book> {
  const now = Date.now();
  const book: Book = { id: newId(), done: false, createdAt: now, updatedAt: now, ...input };
  try {
    await (await books()).add(book);
  } catch (error) {
    throw new Error(error instanceof Error ? `The book could not be saved: ${error.message}` : "The book could not be saved.");
  }
  return book;
}

export async function updateBook(id: string, input: BookInput): Promise<void> {
  try {
    await (await books()).update(id, { ...input, updatedAt: Date.now() });
  } catch (error) {
    throw new Error(error instanceof Error ? `The change could not be saved: ${error.message}` : "The change could not be saved.");
  }
}

export async function setBookDone(id: string, done: boolean): Promise<void> {
  try {
    await (await books()).update(id, { done, updatedAt: Date.now() });
  } catch (error) {
    throw new Error(error instanceof Error ? `The read state could not be saved: ${error.message}` : "The read state could not be saved.");
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    await (await books()).delete(id);
  } catch (error) {
    throw new Error(error instanceof Error ? `The book could not be deleted: ${error.message}` : "The book could not be deleted.");
  }
}
