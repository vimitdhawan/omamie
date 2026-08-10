import { Header } from "@/features/landing/components/header";
import { Toaster } from "@/components/ui/sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative min-h-screen">
        <div className="relative z-10">
          <Header />
          {children}
          <Toaster />
        </div>
      </div>
    </>
  );
}
