/**
 * This application's database.
 *
 * The reusable half of the setup is in `lib/storage/` and is not edited. This file is the half
 * that describes the product: which tables exist, what is indexed, how the schema has changed over
 * time, and what a first visit starts with.
 *
 * This is version 1 of a personal reading list. The list starts empty by design: an empty list
 * shows the app's own invitation to add the first book, so there is no example content to seed.
 */
import { defineDatabase } from "@/lib/storage/database";

export type Book = {
  id: string;
  title: string;
  author: string;
  /** Why I want to read it. May be empty. */
  note: string;
  done: boolean;
  /** Epoch millis. Indexed, because the list is ordered by it — newest first. */
  createdAt: number;
  /** Epoch millis, so an edit can be timestamped even though nothing is sorted by it. */
  updatedAt: number;
};

/** Ids are generated here so the data layer never depends on an auto-increment round trip. */
export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const database = defineDatabase<{ books: Book }>({
  // Part of the origin's storage identity. Renaming it does not migrate anything — it points the
  // application at a different, empty database and abandons the old one in place. That is exactly
  // what you want on a first build, and never what you want afterwards.
  name: "reading-list",
  versions: [
    // Only the primary key and the property the list is ordered by. `title`, `author`, `note` and
    // `done` are stored but never filtered or sorted by, so indexing them would cost writes and
    // buy nothing.
    { version: 1, stores: { books: "id, createdAt" } },
  ],
});
