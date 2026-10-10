import { BookList } from "@/components/book-list";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <BookList />
    </main>
  );
}