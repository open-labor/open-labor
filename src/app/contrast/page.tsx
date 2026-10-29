import { ScenarioCard } from "@/components/scenario-card";
import { scenariosByCategory } from "@/lib/content";

export default async function ContrastPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <ScenarioCard groups={scenariosByCategory()} initialCategory={category} />;
}
