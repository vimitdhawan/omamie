import { getAllProperties } from "@/features/admin/properties/service";
import { AdminPropertiesTable } from "@/features/admin/properties/components/admin-properties-table";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div className="flex-1 space-y-8 p-8">
      <AdminPropertiesTable properties={properties} />
    </div>
  );
}
