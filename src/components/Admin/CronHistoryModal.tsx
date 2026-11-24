"use client";

import React, { useState } from "react";
import {
  X,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Calendar,
  Zap,
  Terminal,
  Database,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export interface SeedLogItem {
  id: string;
  product_id: string;
  run_type: "manual" | "scheduled";
  status: "success" | "error";
  details?: string;
  duration_ms?: number;
  created_at: string;
}

interface CronHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    accentColor?: string;
    demoDbUrl?: string;
  } | null;
  seedConfig: {
    cronTime: string;
    isEnabled: boolean;
    lastRunAt?: string;
    lastStatus?: string;
  } | null;
  logs: SeedLogItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onTriggerNow: () => void;
  isTriggering: boolean;
}

export const CronHistoryModal: React.FC<CronHistoryModalProps> = ({
  isOpen,
  onClose,
  product,
  seedConfig,
  logs,
  isLoading,
  onRefresh,
  onTriggerNow,
  isTriggering,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  const totalRuns = logs.length;
  const successRuns = logs.filter(l => l.status === "success").length;
  const failureRuns = logs.filter(l => l.status === "error").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-3xl w-full flex flex-col my-auto max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-xs"
              style={{ backgroundColor: product.accentColor || "#2563eb" }}
            >
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">
                  Cron & Seed Reset History
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {product.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated midnight reset & manual database seed execution audit trail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status & Metrics Strip */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Daily Schedule</span>
              <span className="font-semibold text-slate-800">
                {seedConfig?.isEnabled ? `${seedConfig.cronTime || "03:00"} (Active)` : "Disabled"}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Total Recorded</span>
              <span className="font-semibold text-slate-800">{totalRuns} Runs</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 block leading-tight">Successful</span>
              <span className="font-semibold text-emerald-800">{successRuns}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-600 block leading-tight">Failures</span>
              <span className="font-semibold text-rose-800">{failureRuns}</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading execution logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No execution logs recorded yet</p>
              <p className="text-slate-400 text-[11px] mt-1">
                Scheduled cron resets or manual seed executions will appear here automatically.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const isSuccess = log.status === "success";
              const isExpanded = expandedLogId === log.id;
              const dateStr = new Date(log.created_at).toLocaleString();

              return (
                <div
                  key={log.id}
                  className={`rounded-2xl border transition-all text-xs overflow-hidden ${
                    isSuccess
                      ? "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                      : "bg-rose-50/20 border-rose-200 shadow-2xs"
                  }`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      {isSuccess ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold capitalize text-xs ${
                              isSuccess ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {log.status === "success" ? "Reset Completed" : "Reset Failed"}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              log.run_type === "scheduled"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {log.run_type === "scheduled" ? "Cron (Midnight)" : "Manual Trigger"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{dateStr}</span>
                          {log.duration_ms !== undefined && (
                            <>
                              <span>&bull;</span>
                              <span>{(log.duration_ms / 1000).toFixed(2)}s runtime</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        {isExpanded ? "Hide Logs" : "View Logs"}
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Expandable Details Log Area */}
                  {isExpanded && log.details && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-900 rounded-b-2xl">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1.5 pt-1 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-emerald-400" /> Output Console
                        </span>
                        <span>Log ID: {log.id.slice(0, 8)}...</span>
                      </div>
                      <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed border border-slate-800 whitespace-pre-wrap">
                        {log.details}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {seedConfig?.lastRunAt ? (
              <span>
                Last automated run: <strong className="text-slate-700">{new Date(seedConfig.lastRunAt).toLocaleString()}</strong>
              </span>
            ) : (
              <span>No automated runs executed yet</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onTriggerNow}
              disabled={isTriggering}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isTriggering ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Seed...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Run Seed Reset Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
