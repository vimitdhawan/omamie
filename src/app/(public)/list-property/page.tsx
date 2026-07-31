import { ListPropertyForm } from "@/features/properties/components/list-property-form";
import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";

export default function ListPropertyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white px-4 pt-24 pb-12">
        <ListPropertyForm />
      </main>
      <Footer />
    </>
  );
}
