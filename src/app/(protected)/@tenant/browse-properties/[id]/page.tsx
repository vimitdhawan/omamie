import { notFound } from "next/navigation";
import { getPropertyDetailAction } from "@/features/properties/actions";
import { PropertyDetailClient } from "./property-detail-client";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;
  const result = await getPropertyDetailAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <PropertyDetailClient property={result.data} />;
}
