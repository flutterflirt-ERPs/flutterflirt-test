import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BizboxContent from "@/components/Bizbox/BizboxContent";

export const metadata: Metadata = {
  title: "BizBox - One Platform to Run Your Entire Business",
  description:
    "BizBox by FlutterFlirt: A secure, multi-purpose ERP for POS, inventory, customers, billing, service and connected devices.",
  alternates: { canonical: "/bizbox" },
  openGraph: {
    title: "BizBox - One Platform to Run Your Entire Business | FlutterFlirt",
    description:
      "BizBox by FlutterFlirt: A secure, multi-purpose ERP for POS, inventory, customers, billing, service and connected devices.",
    url: "https://flutterflirt.com/bizbox",
  },
};

export default function BizboxPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#f8fafc]">
        <BizboxContent />
      </main>
      <Footer />
    </>
  );
}
