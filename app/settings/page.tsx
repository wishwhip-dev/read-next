import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings-panel";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <SettingsPanel />
    </main>
  );
}