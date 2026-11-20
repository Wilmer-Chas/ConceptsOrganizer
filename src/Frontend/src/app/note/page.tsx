import { Suspense } from "react";
import { NoteEditor } from "@/Features/NoteEditor/NoteEditor";

export default async function NotePage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; q?: string }>;
}) {
  const params = await searchParams;
  const path = params.path ?? "";
  if (!path) {
    return <p style={{ padding: "1.4rem" }}>Missing note path.</p>;
  }
  return (
    <Suspense fallback={<p style={{ padding: "1.4rem" }}>Loading note…</p>}>
      <NoteEditor path={path} />
    </Suspense>
  );
}
