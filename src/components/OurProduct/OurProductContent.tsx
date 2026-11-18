"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowUpRight,
  Database,
  Bot,
  Radio,
  ArrowRight,
  Loader2,
  Search,
  Sparkles,
  X,
  ShieldCheck,
  Check,
  Building2,
  Boxes,
  Lock,
  Layers,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Product {
  id: string;
  category: "erp" | "crm" | "custom";
  title: string;
  badge: string;
  tagline: string;
  description: string;
  demoUrl: string;
  demoDbUrl?: string;
  accentColor: string;
  icon?: React.ComponentType<{ className?: string }>;
  keyFeatures: string[];
  metrics: { label: string; value: string }[];
  previewTags: string[];
}

function SimpleProductCard({
  product,
  onOpenDetails,
  onOpenDemo,
}: {
  product: Product;
  onOpenDetails: (p: Product) => void;
  onOpenDemo: (p: Product) => void;
}) {
  const accent = product.accentColor || "#2563eb";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 hover:border-slate-300 bg-white p-5 shadow-xs transition-colors duration-200">
      <div>
        {/* Top Row: Badge only */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: accent }}
          >
            {product.badge}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-base font-bold text-[#050505] tracking-tight leading-snug"
          style={{ fontFamily: "var(--font-geist), Georgia, serif" }}
        >
          {product.title}
        </h3>

        {/* Key Features Bullets */}
        {product.keyFeatures && product.keyFeatures.length > 0 && (
          <div className="mt-3.5 border-t border-slate-100 pt-3">
            <ul className="space-y-1.5">
              {product.keyFeatures.slice(0, 3).map((feat, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-600 mt-0.5" />
                  <span className="line-clamp-1">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Performance Metrics Pill (if metrics exist) */}
        {product.metrics && product.metrics.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-50 border border-slate-100 p-2 text-center">
            {product.metrics.slice(0, 2).map((m, idx) => (
              <div key={idx} className="px-1">
                <p className="text-xs font-extrabold text-slate-900 leading-none">{m.value}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Bottom CTA */}
      <div className="mt-4 border-t border-slate-100 pt-3.5 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetails(product)}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-semibold text-xs transition bg-slate-50 hover:bg-slate-100 cursor-pointer"
        >
          Details
        </button>

        <button
          onClick={() => onOpenDemo(product)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer active:scale-[0.98]"
          style={{ backgroundColor: accent }}
        >
          <span>Take Demo</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "e622a234-bb58-4d82-94b3-e6abedeea95c",
    category: "erp",
    title: "StockPilot WMS",
    badge: "Warehouse & Logistics ERP",
    tagline: "Intelligent multi-warehouse inventory control, dispatch automation, and real-time stock telemetry.",
    description: "An agile, multi-tenant warehouse management and enterprise logistics suite designed for high-throughput supply chains. Seamlessly orchestrates multi-bin lot tracking, automated picking & dispatch manifests, barcode scanner telemetry, and purchase order reconciliation with live database audit trails.",
    demoUrl: "https://demostock-pilot-wms.vercel.app",
    demoDbUrl: "postgresql://neondb_owner:npg_uSie1l3pHbQv@ep-misty-wildflower-a129azf7-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    accentColor: "#46b969",
    icon: Database,
    keyFeatures: [
      "Multi-Location Lot, Batch & Serial Tracking",
      "Automated Inbound Receiving & Barcode Dispatch Manifests",
      "Live Database Sync & Automated Stock Level Threshold Alerts",
      "Pick-Pack-Ship Optimization with Real-Time Bin Routing",
      "Role-Based Access Control & Strict Transaction Audits"
    ],
    metrics: [
      { label: "Inventory Accuracy", value: "99.9%" },
      { label: "Dispatch Velocity", value: "2.4x" },
      { label: "Stockout Reduction", value: "-65%" }
    ],
    previewTags: ["WMS", "Logistics", "Inventory ERP", "Supply Chain"]
  }
];

export default function OurProductContent() {
  const [activeTab, setActiveTab] = useState<"all" | "erp" | "crm">("all");
  const [productList, setProductList] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Request Demo Modal State
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedProductForDemo, setSelectedProductForDemo] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    phoneNumber: "",
    companyName: "",
    companySize: "10-50 employees",
    notes: "",
  });
  const [submittingDemo, setSubmittingDemo] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProducts(true);
        const prodRes = await fetch(`${API_URL}/api/products`);
        if (prodRes.ok) {
          const data = await prodRes.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProductList(data.products);
          } else {
            setProductList(FALLBACK_PRODUCTS);
          }
        } else {
          setProductList(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.warn("Using fallback data", err);
        setProductList(FALLBACK_PRODUCTS);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenDemoModal = (product?: Product) => {
    setSelectedProductForDemo(product || null);
    setDemoSuccess(false);
    setFeedbackMsg(null);
    setDemoModalOpen(true);
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.workEmail.trim() || !formData.companyName.trim()) {
      setFeedbackMsg({ type: "error", text: "Please enter your full name, work email, and company." });
      return;
    }

    try {
      setSubmittingDemo(true);
      setFeedbackMsg(null);
      const res = await fetch(`${API_URL}/api/demo-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          workEmail: formData.workEmail,
          phoneNumber: formData.phoneNumber,
          companyName: formData.companyName,
          companySize: formData.companySize,
          productInterested: selectedProductForDemo ? selectedProductForDemo.title : "Dynamics 365 Finance & Operations",
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setDemoSuccess(true);
        setFeedbackMsg({
          type: "success",
          text: `Demo credentials delivered to ${formData.workEmail}!`,
        });
      } else {
        setFeedbackMsg({ type: "error", text: data.message || "Failed to submit demo request." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network connection error. Please try again." });
    } finally {
      setSubmittingDemo(false);
    }
  };

  const filteredProducts = productList
    .filter(p => activeTab === "all" || p.category === activeTab)
    .filter(p =>
      searchQuery.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.badge.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (typeof window !== "undefined") {
      const catalogEl = document.getElementById("product-catalog-section");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 antialiased selection:bg-blue-600 selection:text-white min-h-screen">

      {/* ── 1. CENTERED HERO SECTION ── */}
      <section className="pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 border-b border-slate-200/80 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          {/* Badge */}
          <p className="text-xs md:text-sm font-medium uppercase tracking-[0.25em] text-[#2563eb] mb-4">
            Enterprise Applications
          </p>

          {/* Centered Heading */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.08] tracking-[-0.03em] text-[#050505] max-w-4xl mx-auto"
            style={{ fontFamily: "var(--font-geist), Georgia, serif" }}
          >
            Software engineered for{" "}
            <span
              style={{
                fontFamily: "var(--font-allura), cursive",
                color: "#244572",
                fontSize: "1.25em",
                letterSpacing: "normal",
              }}
              className="inline-block select-none"
            >
              momentum.
            </span>
          </h1>

          {/* Centered Subtitle */}
          <p className="mt-5 text-[15px] sm:text-[17px] text-[#475569] max-w-2xl mx-auto leading-relaxed font-normal">
            Explore dedicated SaaS applications across finance, supply chain, CRM, and edge operations. Request instant demo access and receive your credentials right in your inbox.
          </p>

          {/* Centered CTA */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => handleOpenDemoModal()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0a0f18] to-[#1a2333] px-7 py-3.5 text-[13px] sm:text-[14px] font-medium text-white shadow-[0_8px_20px_rgba(10,15,24,0.15)] transition-all duration-300 hover:shadow-[0_12px_25px_rgba(10,15,24,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Request Demo Access</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Centered Micro Proof Points Strip */}
          <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div>
              <p
                className="text-2xl sm:text-3xl font-bold text-[#050505] leading-none"
                style={{ fontFamily: "var(--font-geist), Georgia, serif" }}
              >
                Instant
              </p>
              <p className="text-xs text-[#647b9b] mt-1.5 font-medium">Automatic Credential Delivery</p>
            </div>
            <div>
              <p
                className="text-2xl sm:text-3xl font-bold text-[#050505] leading-none"
                style={{ fontFamily: "var(--font-geist), Georgia, serif" }}
              >
                48 Hours
              </p>
              <p className="text-xs text-[#647b9b] mt-1.5 font-medium">Valid from First Login</p>
            </div>
            <div>
              <p
                className="text-2xl sm:text-3xl font-bold text-[#050505] leading-none"
                style={{ fontFamily: "var(--font-geist), Georgia, serif" }}
              >
                Isolated
              </p>
              <p className="text-xs text-[#647b9b] mt-1.5 font-medium">Dedicated Database per Demo</p>
            </div>
            <div>
              <p
                className="text-2xl sm:text-3xl font-bold text-[#050505] leading-none"
                style={{ fontFamily: "var(--font-geist), Georgia, serif" }}
              >
                Full Access
              </p>
              <p className="text-xs text-[#647b9b] mt-1.5 font-medium">Complete Feature Evaluation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CATALOG BROWSER & SEGMENTED TABS ── */}
      <section id="product-catalog-section" className="py-12 sm:py-16 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight"
              style={{ fontFamily: "var(--font-geist), Georgia, serif" }}
            >
              Production Software & Cloud Suites
            </h2>
            <p className="text-xs sm:text-sm text-[#647b9b] mt-1 font-normal">
              Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} enterprise solutions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#cbe0fb] rounded-full text-xs text-[#0f1723] placeholder-[#8babc6] focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#edf5ff] border border-[#cbe0fb] p-1 rounded-full text-xs font-semibold text-[#526987] overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === "all" ? "bg-white text-[#0f1723] shadow-xs font-bold" : "hover:text-[#0f1723]"
                }`}
              >
                All ({productList.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("erp");
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === "erp" ? "bg-white text-[#0f1723] shadow-xs font-bold" : "hover:text-[#0f1723]"
                }`}
              >
                ERP Systems
              </button>
              <button
                onClick={() => {
                  setActiveTab("crm");
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === "crm" ? "bg-white text-[#0f1723] shadow-xs font-bold" : "hover:text-[#0f1723]"
                }`}
              >
                CRM & Sales
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. PRODUCT CARDS GRID (4 in a row on large screens) ── */}
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
            <p className="mt-3.5 text-xs font-semibold text-slate-500 tracking-wide">
              Loading enterprise applications...
            </p>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center p-6">
            <Boxes className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-base font-bold text-slate-900">No applications found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              We couldn&apos;t find any software suites matching your current filters or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <SimpleProductCard
                key={product.id}
                product={product}
                onOpenDetails={setDetailsProduct}
                onOpenDemo={handleOpenDemoModal}
              />
            ))}
          </div>
        )}

        {/* ── PAGINATION CONTROLS ── */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-6">
            <p className="text-xs text-slate-500">
              Showing page <strong className="text-slate-800">{validCurrentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong>
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(Math.max(1, validCurrentPage - 1))}
                disabled={validCurrentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1;
                  const isActive = pageNum === validCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition ${isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, validCurrentPage + 1))}
                disabled={validCurrentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── 4. CLEAN BOTTOM BANNER / CONSULTATION CTA ── */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
                Bespoke Engineering & Deployment
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
                Looking for a tailored ERP or CRM configuration?
              </h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Our certified enterprise architects customize workflows, connect multi-branch databases, and integrate legacy systems tailored specifically to your organization&apos;s operational rhythm.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleOpenDemoModal()}
                className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer"
              >
                Request Custom Demo
              </button>
              <Link
                href="/services"
                className="px-6 py-3.5 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
              >
                Explore Practices
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. REQUEST DEMO MODAL ── */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {demoSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Credentials Will Be Mailed To You!</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Your demo credentials have been generated and dispatched to <strong className="text-slate-900">{formData.workEmail}</strong>.
                </p>

                <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-600">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Demo Notice & Access Rules:
                  </div>
                  <p className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">&bull;</span>
                    <span><strong>Shared B2B SaaS Demo:</strong> This is an interactive shared B2B SaaS demo environment pre-configured for operational evaluation.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">&bull;</span>
                    <span><strong>Application:</strong> {selectedProductForDemo?.title || "Dynamics 365 Finance & Operations"}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">&bull;</span>
                    <span><strong>Login URL:</strong> Check your inbox at <span className="font-semibold text-slate-900">{formData.workEmail}</span> for your direct access link and temporary password.</span>
                  </p>
                  <p className="flex items-start gap-1.5 text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>48-Hour Timer:</strong> Access is valid for exactly <strong>48 hours from your first login</strong>. Closing the window or waiting does not consume any trial time until you sign in.</span>
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setDemoModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Got It, Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    {selectedProductForDemo ? selectedProductForDemo.badge : "Enterprise Cloud Demo"}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Request Demo Access
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedProductForDemo
                      ? `Instant credentials will be delivered to your work email for ${selectedProductForDemo.title}.`
                      : "Receive instant demo credentials for FlutterFlirt enterprise applications."
                    }
                  </p>
                </div>

                {feedbackMsg && (
                  <div className={`p-3 rounded-xl text-xs mb-4 font-semibold ${feedbackMsg.type === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                    {feedbackMsg.text}
                  </div>
                )}

                <form onSubmit={handleDemoSubmit} className="space-y-3.5 text-left text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@company.com"
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Global Logistics"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Company Size
                      </label>
                      <select
                        value={formData.companySize}
                        onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-600 text-xs bg-white"
                      >
                        <option value="1-10 employees">1 - 10 employees</option>
                        <option value="10-50 employees">10 - 50 employees</option>
                        <option value="50-250 employees">50 - 250 employees</option>
                        <option value="250-1000 employees">250 - 1000 employees</option>
                        <option value="1000+ employees">1000+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Select Project / Application *
                    </label>
                    <select
                      value={selectedProductForDemo?.id || (productList.length > 0 ? productList[0].id : "")}
                      onChange={(e) => {
                        const found = productList.find((p) => p.id === e.target.value);
                        setSelectedProductForDemo(found || null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-600 font-semibold text-xs bg-white"
                    >
                      {productList.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.title} ({prod.badge})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingDemo}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {submittingDemo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Credentials & Sending Email...</span>
                        </>
                      ) : (
                        <span>Request Demo & Receive Credentials</span>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2">
                      Credentials will be emailed immediately. Your 48h timer begins on first login.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 6. COMPREHENSIVE PRODUCT DETAILS MODAL (Focused, Clean & Beautiful) ── */}
      {detailsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => setDetailsProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3.5 mb-5 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                {React.createElement(detailsProduct.icon || Database, { className: "w-5 h-5" })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    {detailsProduct.badge}
                  </span>
                  {detailsProduct.demoDbUrl && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Database Linked
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mt-0.5">
                  {detailsProduct.title}
                </h3>
              </div>
            </div>

            {/* Tagline callout */}
            {detailsProduct.tagline && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-semibold text-blue-900 mb-5 leading-relaxed">
                {detailsProduct.tagline}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Architecture & Functional Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {detailsProduct.description}
              </p>
            </div>

            {/* Key Features List */}
            {detailsProduct.keyFeatures && detailsProduct.keyFeatures.length > 0 && (
              <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Capabilities & Modules Included
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {detailsProduct.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {detailsProduct.metrics && detailsProduct.metrics.length > 0 && (
              <div className="mb-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Evaluated Benchmarks & Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailsProduct.metrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                      <p className="text-base font-extrabold text-slate-900">{m.value}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {detailsProduct.previewTags && detailsProduct.previewTags.length > 0 && (
              <div className="mb-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                {detailsProduct.previewTags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDetailsProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = detailsProduct;
                  setDetailsProduct(null);
                  handleOpenDemoModal(target);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <span>Request Live Demo Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
