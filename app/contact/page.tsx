import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Our Technology Consulting Team",
  description:
    "Tell FlutterFlirt about your ERP, CRM, automation, cloud, or custom software project and discover a practical path forward.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Our Technology Consulting Team | FlutterFlirt",
    description:
      "Tell FlutterFlirt about your ERP, CRM, automation, cloud, or custom software project and discover a practical path forward.",
    url: "https://flutterflirt.com/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <Contact />
      <Footer />
    </>
  );
}