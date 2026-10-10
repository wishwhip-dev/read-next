"use client";

/**
 * The settings screen's content: the move-to-another-device panel, plus a file export/import as a
 * plain backup. The move panel is the shipped component — one code, one day, one copy.
 */
import { useState } from "react";
import Link from "next/link";
import { MovePanel } from "@/components/move-panel";
import { FileDrop } from "@/components/file-drop";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { database } from "@/lib/db";
import { useDatabaseTransfer, useStorageStatus } from "@/lib/storage/react";

export function SettingsPanel() {
  const storageStatus = useStorageStatus(database);
  const { state, exportToFile, importFromFile } = useDatabaseTransfer(database);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function chooseFile(files: File[], rejected: File[]) {
    if (rejected.length > 0 || files.length === 0) {
      setPendingFile(null);
      return;
    }
    setPendingFile(files[0]);
  }

  async function runImport(mode: "replace" | "merge") {
    if (!pendingFile) return;
    await importFromFile(pendingFile, mode);
    setPendingFile(null);
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/">Back to my list</Link>
        </Button>
      </div>

      {storageStatus === "memory" && (
        <Alert>
          <AlertTitle>This browser will not keep your list</AlertTitle>
          <AlertDescription>
            Storage is unavailable here, so the list lives in memory for this visit only. Export it
            to a file before you close the tab.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Keep a copy of the list</CardTitle>
          <CardDescription>
            The list lives only in this browser. A file is a backup you can load on any device.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Button onClick={exportToFile} className="min-h-11">
              Export the list to a file
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Downloads a JSON copy of every book on the list.
            </p>
          </div>

          <div className="grid gap-2">
            <FileDrop
              accept="application/json,.json"
              label="Choose a backup file"
              onFiles={chooseFile}
            >
              <span className="text-xs text-muted-foreground">
                The file this app exported earlier. Nothing changes until you press a button below.
              </span>
            </FileDrop>
            {pendingFile && (
              <div className="grid gap-2 rounded-lg border p-3">
                <p className="text-sm">
                  Ready to load <span className="font-medium">{pendingFile.name}</span>.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button className="min-h-11" onClick={() => runImport("replace")}>
                    Load file, replacing this list
                  </Button>
                  <Button variant="outline" className="min-h-11" onClick={() => runImport("merge")}>
                    Load file, adding to this list
                  </Button>
                  <Button variant="ghost" className="min-h-11" onClick={() => setPendingFile(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {state.kind === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            )}
            {state.kind === "imported" && (
              <p className="text-sm text-muted-foreground">
                Loaded: {state.result.rows} book{state.result.rows === 1 ? "" : "s"} written to the list.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Move to another device</CardTitle>
        </CardHeader>
        <CardContent>
          <MovePanel database={database} />
        </CardContent>
      </Card>
    </div>
  );
}