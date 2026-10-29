import { loadSlices } from "@/lib/content";
import { CorpusBrowser } from "@/components/corpus-browser";

export default function CorpusPage() {
  return <CorpusBrowser slices={loadSlices()} />;
}
