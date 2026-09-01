import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyReviewTable } from "@/features/admin/components/property-review-table";
import {
  getAllProperties,
  getPropertiesForReview,
} from "@/features/admin/service";

export default async function AdminPropertiesPage() {
  const [pendingReviews, allProperties] = await Promise.all([
    getPropertiesForReview(),
    getAllProperties(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Property Management</h1>
        <p className="text-muted-foreground">
          Review and manage all property listings
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Properties ({allProperties.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <PropertyReviewTable properties={pendingReviews} />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <PropertyReviewTable properties={allProperties} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
