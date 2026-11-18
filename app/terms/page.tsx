import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TermsContent from "@/components/Terms/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service | Enterprise Agreement",
  description:
    "Review the Terms of Service and Master Services Agreement governing software development, Dynamics 365 consulting, and technology services by FlutterFlirt Technologies Pvt. Ltd.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | FlutterFlirt Technologies",
    description:
      "Review the Terms of Service governing software development, Dynamics 365, and consulting services by FlutterFlirt Technologies Pvt. Ltd.",
    url: "https://flutterflirt.com/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#dfeaf3]">
        <TermsContent />
      </main>
      <Footer />
    </>
  );
}
