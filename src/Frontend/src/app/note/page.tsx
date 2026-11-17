import { NoteEditor } from "@/Features/NoteEditor/NoteEditor";

export default async function NotePage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const params = await searchParams;
  const path = params.path ?? "";
  if (!path) {
    return <p style={{ padding: "1.4rem" }}>Missing note path.</p>;
  }
  return <NoteEditor path={path} />;
}
