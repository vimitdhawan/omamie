import { Card } from "@/components/ui/card";

export default function MyRentalPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-screen-lg px-4 md:px-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Rental</h1>
          <p className="mt-2 text-gray-600">Your current rental information</p>
        </header>

        <Card className="p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No Active Lease
          </h3>
          <p className="text-gray-600">
            You don&apos;t have an active rental lease yet. Once you sign a
            lease, your rental information will appear here.
          </p>
        </Card>
      </div>
    </div>
  );
}
