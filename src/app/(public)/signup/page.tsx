import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  // Default intent is "list-property"
  // In the future, this can be derived from URL params or context
  const intent = "list-property" as const;

  return (
    <div className="bg-canvas flex min-h-screen flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex min-h-svh w-full items-center items-start justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignupForm intent={intent} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
