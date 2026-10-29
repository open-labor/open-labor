import { AssessClient } from "@/components/assess-client";
import { loadSlices } from "@/lib/content";

export default function AssessPage() {
  return <AssessClient slices={loadSlices()} />;
}
