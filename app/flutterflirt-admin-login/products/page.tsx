"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { PopupToast } from "@/components/ui/dialog-popup";
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Layers,
  Sparkles,
  Database,
  BarChart3,
  Bot,
  Zap,
  ShieldCheck,
  X,
  Loader2,
  Copy,
  TrendingUp,
  Tag,
  LayoutGrid,
  List,
  Server,
  Globe2,
  FileCode,
  Clock,
  Play,
  UploadCloud,
  Check,
  AlertCircle,
  ArrowRight
} from "lucide-react";

interface SaaSProduct {
  id: string;
  category: "erp" | "crm" | "custom";
  title: string;
  badge: string;
  tagline: string;
  description: string;
  demoUrl: string;
  demoDbUrl?: string;
  accentColor: string;
  status: "active" | "draft" | "archived";
  keyFeatures: string[];
  metrics: { label: string; value: string }[];
  previewTags: string[];
  sortOrder?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductManagementPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [products, setProducts] = useState<SaaSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SaaSProduct | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SaaSProduct>>({
    category: "erp",
    status: "active",
    accentColor: "#2563eb",
    keyFeatures: [],
    metrics: [{ label: "", value: "" }],
    previewTags: []
  });

  const [featureInput, setFeatureInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Seed Manager Modal State
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [seedProduct, setSeedProduct] = useState<SaaSProduct | null>(null);
  const [seedConfig, setSeedConfig] = useState<{
    cronTime: string;
    isEnabled: boolean;
    fileName: string | null;
    originalName?: string;
    hasContent: boolean;
    lastRunAt?: string;
    lastStatus?: string;
    lastLog?: string;
  }>({
    cronTime: "03:00",
    isEnabled: true,
    fileName: null,
    hasContent: false,
  });
  const [seedFile, setSeedFile] = useState<File | null>(null);
  const [seedCodeInput, setSeedCodeInput] = useState("");
  const [isUploadingSeed, setIsUploadingSeed] = useState(false);
  const [isTriggeringSeed, setIsTriggeringSeed] = useState(false);
  const [seedLogs, setSeedLogs] = useState<any[]>([]);

  const loadProducts = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        setToastMessage("Failed to load products from server");
        setToastType("error");
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      setToastMessage("Could not connect to backend server");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = sessionStorage.getItem("flutterflirt_admin_token");
    if (!savedToken) {
      router.push("/flutterflirt-admin-login");
    } else {
      setToken(savedToken);
      loadProducts(savedToken);
    }
    setIsInitializing(false);
  }, [router]);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || prod.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || prod.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      category: "erp",
      title: "",
      badge: "Cloud ERP",
      tagline: "",
      description: "",
      demoUrl: "",
      accentColor: "#2563eb",
      status: "active",
      keyFeatures: [],
      metrics: [
        { label: "Deployment", value: "Fast" },
        { label: "ROI", value: "3x" }
      ],
      previewTags: []
    });
    setFeatureInput("");
    setTagInput("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: SaaSProduct) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setFeatureInput("");
    setTagInput("");
    setIsModalOpen(true);
  };

  const handleOpenSeedModal = async (prod: SaaSProduct) => {
    setSeedProduct(prod);
    setSeedFile(null);
    setSeedCodeInput("");
    setIsSeedModalOpen(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/products/${prod.id}/seed-config`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSeedConfig(data.config || {
          cronTime: "03:00",
          isEnabled: true,
          fileName: null,
          hasContent: false,
        });
        setSeedLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching seed config:", err);
    }
  };

  const handleSaveSeedConfig = async () => {
    if (!seedProduct || !token) return;
    try {
      setIsUploadingSeed(true);
      const fd = new FormData();
      fd.append("cronTime", seedConfig.cronTime || "03:00");
      fd.append("isEnabled", String(seedConfig.isEnabled));
      if (seedFile) {
        fd.append("seedFile", seedFile);
      } else if (seedCodeInput.trim()) {
        fd.append("seedCode", seedCodeInput.trim());
      }

      const res = await fetch(`${API_URL}/api/admin/products/${seedProduct.id}/seed-config`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage("Seed file and daily nightly schedule saved successfully!");
        setToastType("success");
        handleOpenSeedModal(seedProduct);
      } else {
        setToastMessage(data.message || "Failed to save seed configuration");
        setToastType("error");
      }
    } catch (err: any) {
      console.error("Save seed config error:", err);
      setToastMessage(err.message || "Network error while saving seed config");
      setToastType("error");
    } finally {
      setIsUploadingSeed(false);
    }
  };

  const handleTriggerSeedNow = async () => {
    if (!seedProduct || !token) return;
    if (!confirm(`Run seed file now for "${seedProduct.title}"? This will refresh demo tables according to your script while strictly preserving active demo users.`)) {
      return;
    }

    try {
      setIsTriggeringSeed(true);
      const res = await fetch(`${API_URL}/api/admin/products/${seedProduct.id}/seed-trigger`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage(`Seed executed successfully in ${data.durationMs}ms!`);
        setToastType("success");
        handleOpenSeedModal(seedProduct);
      } else {
        setToastMessage(data.message || "Seed execution failed");
        setToastType("error");
      }
    } catch (err: any) {
      console.error("Trigger seed error:", err);
      setToastMessage(err.message || "Network error while triggering seed");
      setToastType("error");
    } finally {
      setIsTriggeringSeed(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        setToastMessage("Product removed successfully");
        setToastType("success");
      } else {
        const data = await res.json();
        setToastMessage(data.message || "Failed to delete product");
        setToastType("error");
      }
    } catch (err) {
      console.error(err);
      setToastMessage("Network error deleting product");
      setToastType("error");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.tagline) {
      setToastMessage("Please fill in the product title and tagline.");
      setToastType("error");
      return;
    }

    try {
      setSaving(true);
      const isEdit = Boolean(editingProduct?.id);
      const url = isEdit
        ? `${API_URL}/api/admin/products/${editingProduct!.id}`
        : `${API_URL}/api/admin/products`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category || "erp",
          badge: formData.badge || "Cloud Solution",
          tagline: formData.tagline,
          description: formData.description || "",
          demoUrl: formData.demoUrl || "",
          demoDbUrl: formData.demoDbUrl || "",
          accentColor: formData.accentColor || "#2563eb",
          status: formData.status || "active",
          keyFeatures: formData.keyFeatures || [],
          metrics: (formData.metrics || []).filter(m => m.label && m.value),
          previewTags: formData.previewTags || []
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save product");
      }

      if (isEdit) {
        setProducts(products.map((p) => (p.id === data.product.id ? data.product : p)));
        setToastMessage("Product updated successfully!");
      } else {
        setProducts([data.product, ...products]);
        setToastMessage("New SaaS / ERP Product added live!");
      }

      setIsModalOpen(false);
      setToastType("success");
    } catch (err: any) {
      console.error(err);
      setToastMessage(err.message || "Error saving product");
      setToastType("error");
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        keyFeatures: [...(formData.keyFeatures || []), featureInput.trim()]
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (idx: number) => {
    setFormData({
      ...formData,
      keyFeatures: (formData.keyFeatures || []).filter((_, i) => i !== idx)
    });
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        previewTags: [...(formData.previewTags || []), tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const removeTag = (idx: number) => {
    setFormData({
      ...formData,
      previewTags: (formData.previewTags || []).filter((_, i) => i !== idx)
    });
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 min-h-screen bg-[#edf5ff] pb-20 w-full">
        {toastMessage && (
          <PopupToast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full pt-4 md:pt-6">
          {/* Compact Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#cbdff8]/70 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#cbe0fb] shadow-xs text-[#2563eb]">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#10223d]">
                    Product Management
                  </h1>
                  <span className="rounded-full bg-[#dbe8fc] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e40af]">
                    Catalog
                  </span>
                </div>
                <p className="text-xs text-[#617b9d]">
                  Manage cloud ERPs, CRMs, interactive demo URLs, and features.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#1d4ed8]"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Compact Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3.5 rounded-2xl border border-[#cbe0fb] bg-white shadow-xs">
              <p className="text-[10px] font-bold text-[#617b9d] uppercase tracking-wider">Total Products</p>
              <p className="text-xl font-black mt-0.5 text-[#10223d]">{products.length}</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[#cbe0fb] bg-white shadow-xs">
              <p className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider">Active ERPs</p>
              <p className="text-xl font-black mt-0.5 text-[#2563eb]">
                {products.filter((p) => p.category === "erp" && p.status === "active").length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[#cbe0fb] bg-white shadow-xs">
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Active CRMs</p>
              <p className="text-xl font-black mt-0.5 text-rose-600">
                {products.filter((p) => p.category === "crm" && p.status === "active").length}
              </p>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-[24px] border border-[#cbe0fb] bg-white p-5 shadow-[0_12px_40px_rgba(20,50,90,0.05)] mb-6">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8babc6]" />
              <input
                type="text"
                placeholder="Search products by title, tagline, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#f8fbff] border border-[#cbe0fb] rounded-xl text-[#112239] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 bg-[#f8fbff] border border-[#cbe0fb] rounded-xl font-medium text-[#1e3b60] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="erp">ERP Systems</option>
                <option value="crm">Intelligent CRM</option>
                <option value="custom">Custom Platforms</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 bg-[#f8fbff] border border-[#cbe0fb] rounded-xl font-medium text-[#1e3b60] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-[#edf5ff] p-1 rounded-xl border border-[#cbe0fb]">
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "card"
                      ? "bg-white text-[#2563eb] shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white text-[#2563eb] shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                  title="Table / List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Display: Card or List View */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-[24px] border border-[#cbe0fb] bg-white shadow-xs">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
              <p className="mt-3 text-xs font-semibold text-[#617b9d]">Loading products from server...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center rounded-[24px] border border-[#cbe0fb] bg-white shadow-xs">
              <Boxes className="mx-auto h-10 w-10 text-[#9bb5d6]" />
              <p className="mt-3 text-base font-bold text-[#142845]">No products found</p>
              <p className="mt-1 text-xs text-[#617b9d]">Try adjusting your search query or category filters.</p>
            </div>
          ) : viewMode === "card" ? (
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-2 pb-6 scrollbar-thin scrollbar-thumb-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="group relative flex flex-col justify-between rounded-[24px] border border-[#cbe0fb] bg-white p-6 shadow-[0_12px_40px_rgba(20,50,90,0.05)] transition-all hover:border-[#2563eb]/40"
                  >
                    <div className="space-y-4">
                      {/* Top row: Badge Heading & Status */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: prod.accentColor || "#2563eb" }}
                        >
                          {prod.badge}
                        </span>

                        {/* Small Status Indicator Dot with Tooltip */}
                        <div className="flex items-center gap-1.5" title={`Status: ${prod.status}`}>
                          <span
                            className={`h-2 w-2 rounded-full ${
                              prod.status === "active"
                                ? "bg-emerald-500 ring-2 ring-emerald-100"
                                : "bg-slate-300"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <div>
                        <h3 className="text-base font-bold text-[#142845] group-hover:text-[#2563eb] transition">
                          {prod.title}
                        </h3>
                        <p className="text-xs text-[#617b9d] mt-1 line-clamp-2">{prod.tagline}</p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {prod.previewTags?.map((tag, i) => (
                          <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#f0f5fc] text-[#526987]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Metrics preview */}
                      {prod.metrics && prod.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e5effb]">
                          {prod.metrics.map((m, i) => (
                            <div key={i} className="bg-[#f8fbff] p-2 rounded-xl text-center border border-[#e5effb]">
                              <span className="block text-[10px] text-[#8babc6] uppercase font-semibold">{m.label}</span>
                              <span className="font-bold text-xs text-[#142845]">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions & Status */}
                    <div className="mt-5 pt-4 border-t border-[#e5effb] flex items-center justify-between">
                      {/* Left: Connectivity Icons (title on hover) */}
                      <div className="flex items-center gap-1.5">
                        {/* Demo URL Icon */}
                        {prod.demoUrl ? (
                          <a
                            href={prod.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-[#cbe0fb] bg-white text-[#2563eb] hover:bg-[#edf5ff] transition shadow-xs"
                            title="Preview"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed"
                            title="Preview (Not Connected)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {/* Demo DB Icon */}
                        {prod.demoDbUrl ? (
                          <span
                            className="p-1.5 rounded-lg border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 transition shadow-xs cursor-default"
                            title="DB Status (Connected)"
                          >
                            <Database className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed"
                            title="DB Status (Not Linked)"
                          >
                            <Database className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Right: Action Buttons (Edit, Delete) with Clean Borders */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg border border-[#cbe0fb] bg-white text-[#617b9d] hover:text-[#2563eb] hover:bg-[#edf5ff] transition shadow-xs"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-white text-[#617b9d] hover:text-rose-600 hover:bg-rose-50 transition shadow-xs"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Table / List View (matching previous SaaS management view) */
            <div className="bg-white rounded-[24px] border border-[#cbe0fb] shadow-[0_12px_40px_rgba(20,50,90,0.05)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e5effb] bg-[#f8fbff] text-[11px] font-semibold uppercase tracking-wider text-[#617b9d]">
                      <th className="py-4 px-6">Product / Application</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4 text-center">Connectivity</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5effb] text-xs">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#f8fbff]/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: prod.accentColor || "#2563eb" }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#142845] text-sm">{prod.title}</span>
                                <span
                                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: prod.accentColor || "#2563eb" }}
                                >
                                  {prod.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#617b9d] line-clamp-1 max-w-[280px] mt-0.5">
                                {prod.tagline}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-[#edf5ff] text-[#2563eb] font-semibold text-[11px]">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-[#f0f5fc] p-1 rounded-lg border border-[#e2ecf9]">
                            {/* Demo URL Icon */}
                            {prod.demoUrl ? (
                              <a
                                href={prod.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Demo URL Active: ${prod.demoUrl}`}
                                className="p-1.5 rounded-md text-[#2563eb] bg-white shadow-xs hover:bg-blue-50 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span
                                title="No Demo URL"
                                className="p-1.5 rounded-md text-slate-300 cursor-not-allowed"
                              >
                                <ExternalLink className="w-3.5 h-3.5 opacity-40" />
                              </span>
                            )}

                            {/* Demo DB Icon */}
                            {prod.demoDbUrl ? (
                              <span
                                title={`Demo Database Active: ${prod.demoDbUrl.split("@")[1]?.split("/")[0] || "Connected"}`}
                                className="p-1.5 rounded-md text-emerald-600 bg-white shadow-xs cursor-default"
                              >
                                <Database className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span
                                title="No Database Connected"
                                className="p-1.5 rounded-md text-slate-300 cursor-not-allowed"
                              >
                                <Database className="w-3.5 h-3.5 opacity-40" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              prod.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {prod.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenSeedModal(prod)}
                              className="px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition text-[11px] font-semibold flex items-center gap-1"
                              title="Configure Daily Nightly Seed & Run"
                            >
                              <FileCode className="w-3.5 h-3.5" />
                              <span>Seed</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 rounded-lg text-[#617b9d] hover:text-[#2563eb] hover:bg-[#edf5ff] transition"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id)}
                              className="p-1.5 rounded-lg text-[#617b9d] hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Product Create / Edit Modal with Live Card Preview */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-5xl w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {editingProduct ? "Edit Product / ERP" : "Add New SaaS / ERP Product"}
                    </h2>
                    <p className="text-[11px] text-slate-500">Configure parameters on the left; preview the live card on the right.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2-Column Layout: Form on Left, Live Card Preview on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
                {/* Left Form (7 Columns) */}
                <form onSubmit={handleSave} className="lg:col-span-7 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dynamics 365 Finance & Operations"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Badge Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Enterprise ERP, SME Cloud ERP"
                        value={formData.badge || ""}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Category</label>
                      <select
                        value={formData.category || "erp"}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value as SaaSProduct["category"] })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="erp">ERP System</option>
                        <option value="crm">Intelligent CRM</option>
                        <option value="custom">Custom Enterprise SaaS</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Status</label>
                      <select
                        value={formData.status || "active"}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as SaaSProduct["status"] })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="draft">Draft (Hidden)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tagline *</label>
                    <input
                      type="text"
                      required
                      placeholder="Short punchy value proposition..."
                      value={formData.tagline || ""}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Description</label>
                    <textarea
                      rows={3}
                      placeholder="Comprehensive overview of modules, ledger handling, capabilities..."
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Live Demo URL</label>
                      <input
                        type="text"
                        placeholder="https://demo.flutterflirt.com/..."
                        value={formData.demoUrl || ""}
                        onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Accent Theme Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.accentColor || "#2563eb"}
                          onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer border-none"
                        />
                        <input
                          type="text"
                          value={formData.accentColor || "#2563eb"}
                          onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none uppercase font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 block">
                        Project Demo Database URL (PostgreSQL Connection String)
                      </label>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Direct DB Sync
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="postgresql://user:password@host/dbname?sslmode=require..."
                      value={formData.demoDbUrl || ""}
                      onChange={(e) => setFormData({ ...formData, demoDbUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Demo accounts and tenant activity for this application will sync directly with this database instance.
                    </p>

                    {/* Database Seed Script Configuration Button (Inside Edit Modal) */}
                    {editingProduct && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-blue-600" />
                            <span>Database Nightly Seed Script</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Upload a .js / .sql seed script or trigger an immediate demo reset.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenSeedModal(editingProduct)}
                          className="px-3 py-1.5 rounded-lg border border-[#cbe0fb] bg-white text-[#2563eb] hover:bg-blue-50 font-semibold text-xs transition shadow-xs flex items-center gap-1.5 shrink-0"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Configure Seed</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Key Features List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="font-semibold text-slate-700 block">Key Features</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a bullet feature..."
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {formData.keyFeatures?.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-700">{f}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="font-semibold text-slate-700 block">Preview Tags</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Finance, SME, Multi-Tenant..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                      >
                        Add Tag
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.previewTags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {tag}
                          <button type="button" onClick={() => removeTag(idx)}>
                            <X className="w-3 h-3 hover:text-rose-600" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Submit row */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-50"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{saving ? "Saving..." : "Save Product"}</span>
                    </button>
                  </div>
                </form>

                {/* Right Live Card Preview (5 Columns) */}
                <div className="lg:col-span-5 bg-gradient-to-b from-[#f0f6ff] to-[#edf5ff] p-5 rounded-3xl border border-[#cbe0fb] space-y-3 sticky top-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#cbdff8]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e40af] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
                      Live Website Card Preview
                    </span>
                    <span className="text-[10px] font-semibold text-[#617b9b] bg-white px-2 py-0.5 rounded-full border border-[#cbdff8]">
                      Exact User View
                    </span>
                  </div>

                  {/* Simulated Product Card mirroring exactly OurProductContent */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-sm">
                    <div>
                      {/* Top Row: Badge only */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span 
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                          style={{ backgroundColor: formData.accentColor || "#2563eb" }}
                        >
                          {formData.badge || "Cloud Solution"}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-950 tracking-tight leading-snug">
                        {formData.title || "Your Product Title Here"}
                      </h3>

                      {/* Key Feature Bullets */}
                      <div className="space-y-1.5 my-3 pt-2.5 border-t border-slate-100 text-xs">
                        {(formData.keyFeatures && formData.keyFeatures.length > 0
                          ? formData.keyFeatures.slice(0, 3)
                          : [
                              "Multi-Entity & General Ledger Support",
                              "Automated Procurement & AI Invoicing",
                              "Real-time Multi-Warehouse Lot Tracking"
                            ]
                        ).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-600">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Strip with Tags & Action Buttons */}
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                      <div className="flex flex-wrap gap-1">
                        {(formData.previewTags && formData.previewTags.length > 0
                          ? formData.previewTags.slice(0, 2)
                          : ["Enterprise", "Cloud"]
                        ).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {(formData.previewTags?.length || 0) > 2 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[10px] font-medium">
                            +{formData.previewTags!.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs bg-slate-50 cursor-default">
                          Details
                        </span>
                        <div
                          className="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs cursor-default"
                          style={{ backgroundColor: formData.accentColor || "#2563eb" }}
                        >
                          <span>Demo</span>
                          <ArrowRight className="w-3 h-3 text-white/80" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimalistic Daily Night Seed Modal */}
        {isSeedModalOpen && seedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 max-w-lg w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95">
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <FileCode className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">Database Seed Setup</h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Target: <span className="font-semibold text-slate-700">{seedProduct.title}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsSeedModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Minimal File Picker & Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Seed Script (.js / .sql)
                </label>
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="minimalSeedFileInput"
                    accept=".js,.cjs,.mjs,.sql,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSeedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor="minimalSeedFileInput"
                    className="cursor-pointer flex-1 flex items-center justify-between px-3 py-2 border border-slate-200 hover:border-emerald-500 rounded-xl bg-slate-50 hover:bg-white text-xs transition"
                  >
                    <span className="truncate max-w-[240px] text-slate-700">
                      {seedFile ? seedFile.name : seedConfig.fileName ? (seedConfig.originalName || seedConfig.fileName) : "Choose seed.js file..."}
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      Browse
                    </span>
                  </label>
                  {seedFile && (
                    <button
                      type="button"
                      onClick={() => setSeedFile(null)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 text-xs transition"
                      title="Clear file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Time & Toggle Row */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700">Night Run Time</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={seedConfig.cronTime || "03:00"}
                    onChange={(e) => setSeedConfig({ ...seedConfig, cronTime: e.target.value })}
                    className="px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seedConfig.isEnabled}
                      onChange={(e) => setSeedConfig({ ...seedConfig, isEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Subtle Note */}
              <p className="text-[10px] text-slate-400 leading-normal flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Demo users are preserved and only purged after their 48h expire.</span>
              </p>

              {/* Status compact bar if already run */}
              {seedConfig.lastRunAt && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                  <span>Last run: {new Date(seedConfig.lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`font-semibold capitalize ${seedConfig.lastStatus === "success" ? "text-emerald-600" : "text-rose-500"}`}>
                    {seedConfig.lastStatus}
                  </span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTriggerSeedNow}
                  disabled={isTriggeringSeed || (!seedConfig.hasContent && !seedFile)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition disabled:opacity-40 inline-flex items-center gap-1"
                >
                  {isTriggeringSeed ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3" />}
                  <span>Run Now</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSeedModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSeedConfig}
                    disabled={isUploadingSeed}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50 shadow-xs"
                  >
                    {isUploadingSeed && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {toastMessage && (
          <PopupToast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}
      </main>
    </SidebarProvider>
  );
}
