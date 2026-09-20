import { getAllProperties } from "@/features/admin/properties/service";
import { AdminPropertiesTable } from "@/features/admin/properties/components/admin-properties-table";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] leading-tight font-bold">
          Properties
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
          View and manage all properties across the platform.
        </p>
      </div>

      <AdminPropertiesTable properties={properties} />
    </div>
  );
}
