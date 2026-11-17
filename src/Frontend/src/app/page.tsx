import { CanvasExplorer } from "@/Features/CanvasExplorer/CanvasExplorer";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const params = await searchParams;
  return <CanvasExplorer initialPath={params.path ?? ""} />;
}
