import { MatrixView } from "@/components/matrix-view";
import { loadSlices } from "@/lib/content";

export default async function MatrixPage({
  searchParams,
}: {
  searchParams: Promise<{ paradigm?: string }>;
}) {
  const { paradigm } = await searchParams;
  const initial =
    paradigm === "hierarchical" || paradigm === "ai-native" ? paradigm : "all";
  return <MatrixView slices={loadSlices()} initialParadigm={initial} />;
}
