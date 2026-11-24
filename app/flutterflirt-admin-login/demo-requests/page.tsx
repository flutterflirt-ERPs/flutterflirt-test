"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { PopupToast } from "@/components/ui/dialog-popup";
import {
  Sparkles,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Mail,
  Phone,
  Layers,
  ChevronRight,
  ExternalLink,
  X,
  Send,
  Loader2,
  Trash2,
  RefreshCw,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Lock,
  UserCheck
} from "lucide-react";

interface DemoSession {
  id: string;
  demoId: string;
  customerName: string;
  workEmail: string;
  phoneNumber?: string;
  companyName: string;
  companySize?: string;
  application: string;
  targetSubdomain: string;
  username: string;
  tempPasswordPlain?: string;
  status: "pending" | "approved" | "ready" | "active" | "expired" | "revoked";
  createdAt: string;
  approvedAt?: string | null;
  credentialsSentAt?: string | null;
  firstLoginAt?: string | null;
  expiresAt?: string | null;
  lastLoginAt?: string | null;
  loginCount?: number;
  activityLog?: Array<{ event: string; timestamp: string; ip?: string }>;
  notes?: string;
  timeRemaining?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DemoRequestsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessions, setSessions] = useState<DemoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // Selected session for details modal
  const [selectedSession, setSelectedSession] = useState<DemoSession | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Gateway Simulation Modal
  const [simulatingSession, setSimulatingSession] = useState<DemoSession | null>(null);
  const [simPassword, setSimPassword] = useState("");
  const [simResult, setSimResult] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("flutterflirt_admin_token");
    if (!storedToken) {
      router.push("/flutterflirt-admin-login");
      return;
    }
    setToken(storedToken);
    setIsInitializing(false);
    fetchDemoSessions(storedToken);
  }, [router]);

  const fetchDemoSessions = async (authToken: string) => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_URL}/api/admin/demo-sessions`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      } else {
        showToast("error", "Failed to load demo requests from database");
      }
    } catch {
      showToast("error", "Error contacting backend server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToast = (type: "success" | "error" | "info", msg: string) => {
    setToastType(type);
    setToastMessage(msg);
  };

  // 1. Approve & Dispatch Credentials (Timer DOES NOT start here)
  const handleApprove = async (session: DemoSession) => {
    if (!token) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_URL}/api/admin/demo-sessions/${session.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sendEmail: true }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", `Approved! Credentials generated and status set to Ready (6h clock will start on first login).`);
        setSessions((prev) => prev.map((s) => (s.id === session.id ? data.session : s)));
        if (selectedSession?.id === session.id) {
          setSelectedSession(data.session);
        }
      } else {
        showToast("error", data.message || "Failed to approve demo request");
      }
    } catch {
      showToast("error", "Network error approving demo");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Delete Session
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this demo record?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/demo-sessions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        showToast("success", "Demo session removed");
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (selectedSession?.id === id) setSelectedSession(null);
      }
    } catch {
      showToast("error", "Failed to delete demo record");
    }
  };

  // 4. Gateway Simulation (Test First Login from Admin UI)
  const handleSimulateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatingSession) return;
    try {
      setActionLoading(true);
      setSimResult(null);
      const res = await fetch(`${API_URL}/api/demo/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: simulatingSession.username,
          password: simPassword || simulatingSession.tempPasswordPlain,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimResult(`Success: ${data.message} (isFirstLogin: ${data.isFirstLogin})`);
        showToast("success", data.isFirstLogin ? "First login verified! 6h timer started." : "Subsequent login verified.");
        fetchDemoSessions(token!);
      } else {
        setSimResult(`Auth Blocked: ${data.message}`);
        showToast("error", data.message);
      }
    } catch {
      setSimResult("Gateway connection failure");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered session records
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch =
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.demoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.workEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: sessions.length,
      pending: sessions.filter((s) => s.status === "pending").length,
      ready: sessions.filter((s) => s.status === "ready").length,
      active: sessions.filter((s) => s.status === "active").length,
      expired: sessions.filter((s) => s.status === "expired").length,
    };
  }, [sessions]);

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

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full pt-4 md:pt-6 pl-14 sm:pl-16 md:pl-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#cbdff8]/70 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#cbe0fb] shadow-xs text-[#2563eb]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-[#0f172a] sm:text-2xl">
                    Demo User Activity & 6h Expiry Tracker
                  </h1>
                </div>
                <p className="text-xs text-[#64748b]">
                  Instant credential delivery system. Monitor active user logins, evaluate sessions, and track 6h expiry.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDemoSessions(token!)}
                disabled={refreshing}
                className="group relative inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#cbe0fb] hover:border-blue-500/60 shadow-[0_4px_16px_rgba(37,99,235,0.08)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.16)] text-[#10223d] font-bold text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer overflow-hidden"
                title="Refresh demo requests and sync live login status"
              >

                {/* Spinning Icon */}
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                </div>

                <span className="tracking-tight text-slate-700 group-hover:text-blue-600 transition-colors">
                  {refreshing ? "Syncing..." : "Sync Data"}
                </span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white border border-[#cbe0fb] rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Active Demos (Clock Running)</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{counts.active}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Under 6-hour access</div>
            </div>

            <div className="bg-white border border-[#cbe0fb] rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Ready (Timer Not Started)</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{counts.ready}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Creds emailed, awaiting 1st login</div>
            </div>

            <div className="bg-white border border-[#cbe0fb] rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Pending Approval</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{counts.pending}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Awaiting admin review</div>
            </div>

            <div className="bg-white border border-[#cbe0fb] rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Concluded Demos</div>
              <div className="text-2xl font-black text-slate-500 mt-1">{counts.expired}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">6 hours expired</div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white border border-[#cbe0fb] rounded-2xl p-4 shadow-2xs mb-5">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by customer, company, or Demo ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2563eb]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
                {[
                  { key: "all", label: "All", count: counts.all },
                  { key: "active", label: "Active", count: counts.active },
                  { key: "ready", label: "Ready", count: counts.ready },
                  { key: "pending", label: "Pending", count: counts.pending },
                  { key: "expired", label: "Expired", count: counts.expired },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${statusFilter === tab.key
                      ? "bg-[#2563eb] text-white shadow-xs"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === tab.key ? "bg-blue-800 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Demo Sessions Table */}
          <div className="bg-white border border-[#cbe0fb] rounded-2xl shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
                <p className="text-xs font-semibold text-slate-500">Loading demo lifecycle data...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No demo requests found</p>
                <p className="text-xs text-slate-400">Submissions from prospective customers will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase text-[#64748b] border-b border-slate-100 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer & Organization</th>
                      <th className="py-3 px-4">Demo ID & Application</th>
                      <th className="py-3 px-4">Lifecycle Status</th>
                      <th className="py-3 px-4">First Login</th>
                      <th className="py-3 px-4">Expires At</th>
                      <th className="py-3 px-4">Time Remaining</th>
                      <th className="py-3 px-4 text-right min-w-[130px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.map((session) => {
                      const isPending = session.status === "pending";
                      const isReady = session.status === "ready";
                      const isActive = session.status === "active";
                      const isExpired = session.status === "expired";

                      return (
                        <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{session.customerName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{session.companyName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{session.workEmail}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-[#2563eb] text-[11px]">{session.demoId}</div>
                            <div className="text-[11px] text-slate-700 font-medium mt-0.5">{session.application}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">user: {session.username}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                              isReady ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                isPending ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                  "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                              {isReady && <Clock className="w-3 h-3" />}
                              <span className="capitalize">{session.status}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {session.firstLoginAt ? (
                              <div className="text-slate-800 font-medium text-[11px]">
                                {new Date(session.firstLoginAt).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Not logged in yet</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {session.expiresAt ? (
                              <div className="text-slate-800 font-bold text-[11px]">
                                {new Date(session.expiresAt).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className={`font-semibold text-[11px] ${isActive ? "text-emerald-700 font-bold" :
                              isReady ? "text-amber-700" :
                                isExpired ? "text-slate-400" : "text-blue-700"
                              }`}>
                              {session.timeRemaining}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right min-w-[130px] whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 shrink-0">
                              {isPending && (
                                <button
                                  onClick={() => handleApprove(session)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-[11px] inline-flex items-center gap-1 shadow-2xs"
                                >
                                  <UserCheck className="w-3.5 h-3.5" /> Approve
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSimulatingSession(session);
                                  setSimPassword(session.tempPasswordPlain || "");
                                  setSimResult(null);
                                }}
                                title="Simulate Gateway Login Event"
                                className="h-8 w-8 inline-flex items-center justify-center shrink-0 rounded-lg border border-[#cbe0fb] bg-white text-slate-700 hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors shadow-2xs"
                              >
                                <Play className="w-3.5 h-3.5 text-slate-700" />
                              </button>

                              <button
                                onClick={() => setSelectedSession(session)}
                                title="View details"
                                className="h-8 w-8 inline-flex items-center justify-center shrink-0 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-700" />
                              </button>

                              <button
                                onClick={() => handleDelete(session.id)}
                                title="Delete"
                                className="h-8 w-8 inline-flex items-center justify-center shrink-0 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* DETAILS MODAL */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <div className="text-[11px] font-mono font-bold text-[#2563eb]">{selectedSession.demoId}</div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedSession.customerName}</h3>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Company</span>
                    <div className="font-semibold text-slate-800">{selectedSession.companyName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Work Email</span>
                    <div className="font-semibold text-slate-800">{selectedSession.workEmail}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Phone Number</span>
                    <div className="font-semibold text-slate-800">{selectedSession.phoneNumber || "—"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Application</span>
                    <div className="font-semibold text-slate-800">{selectedSession.application}</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl space-y-2">
                  <div className="text-slate-700 font-bold uppercase text-[10px] flex items-center justify-between">
                    <span>Delivered Demo Credentials</span>
                    <span className="text-[10px] font-normal text-blue-700">Used for signing into app</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Login Email:</span>
                      <div className="font-mono font-bold text-slate-900 bg-white px-2 py-1.5 rounded-lg border border-blue-100 text-xs break-all">
                        {selectedSession.workEmail}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Handle: <span className="font-mono">{selectedSession.username}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Password:</span>
                      <div className="font-mono font-bold text-[#2563eb] bg-white px-2 py-1.5 rounded-lg border border-blue-100 text-xs break-all">
                        {selectedSession.tempPasswordPlain || "••••••••"}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Temporary generated password
                      </span>
                    </div>
                  </div>
                  {selectedSession.targetSubdomain && (
                    <div className="pt-2 border-t border-blue-100/70 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Access URL:</span>
                      <a
                        href={selectedSession.targetSubdomain.startsWith("http") ? selectedSession.targetSubdomain : `https://${selectedSession.targetSubdomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        {selectedSession.targetSubdomain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="border border-slate-200 p-3 rounded-xl space-y-1.5">
                  <div className="text-slate-700 font-bold uppercase text-[10px]">Lifecycle & Activity Tracking</div>
                  <div className="flex justify-between text-slate-600">
                    <span>Credentials Delivered:</span>
                    <span>{selectedSession.credentialsSentAt ? new Date(selectedSession.credentialsSentAt).toLocaleString() : "Auto-sent on request"}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Session Logins:</span>
                    <span className="font-bold text-slate-900">{selectedSession.loginCount || 0} times</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>First Login (Timer Start):</span>
                    <span>{selectedSession.firstLoginAt ? new Date(selectedSession.firstLoginAt).toLocaleString() : "Awaiting First Login"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Expires At (+6h):</span>
                    <span>{selectedSession.expiresAt ? new Date(selectedSession.expiresAt).toLocaleString() : "—"}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Last Login Activity:</span>
                    <span>{selectedSession.lastLoginAt ? new Date(selectedSession.lastLoginAt).toLocaleString() : "—"}</span>
                  </div>
                </div>

                {/* Real-time Activity Stream */}
                {selectedSession.activityLog && selectedSession.activityLog.length > 0 && (
                  <div className="border border-slate-200 p-3 rounded-xl">
                    <div className="text-slate-700 font-bold uppercase text-[10px] mb-2 flex items-center justify-between">
                      <span>User Activity Stream</span>
                      <span className="text-[9px] font-normal text-slate-400">Live Gateway Events</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1 text-[11px]">
                      {selectedSession.activityLog.map((act, i) => (
                        <div key={i} className="flex justify-between p-1.5 bg-slate-50 rounded-lg text-slate-600">
                          <span className="font-medium text-slate-800">{act.event}</span>
                          <span className="font-mono text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 mt-4">
                {selectedSession.status === "pending" && (
                  <button
                    onClick={() => handleApprove(selectedSession)}
                    className="px-4 py-2 bg-[#2563eb] text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                  >
                    Approve & Issue Credentials
                  </button>
                )}
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GATEWAY AUTH SIMULATOR MODAL */}
        {simulatingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#2563eb]" />
                  <h3 className="text-base font-bold text-slate-900">Simulate Access Gateway Auth</h3>
                </div>
                <button
                  onClick={() => setSimulatingSession(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Simulates the reverse proxy / gateway intercepting the customer signing in to test the 6-hour first-login trigger.
              </p>

              <form onSubmit={handleSimulateLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Username</label>
                  <input
                    type="text"
                    disabled
                    value={simulatingSession.username}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Password</label>
                  <input
                    type="text"
                    value={simPassword}
                    onChange={(e) => setSimPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                {simResult && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                    {simResult}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSimulatingSession(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
                  >
                    Authenticate as Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </SidebarProvider>
  );
}
