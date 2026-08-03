import Footer from "@/features/landing/components/footer";
import Navbar from "@/features/landing/components/header";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative min-h-screen">
        <div className="relative z-10">
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </>
  );
}
