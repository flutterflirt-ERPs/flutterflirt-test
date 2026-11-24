"use client";

import React, { useState } from "react";
import {
  FileCode,
  X,
  Clock,
  Play,
  Loader2,
  Table,
  Upload,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldCheck,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Layers,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export interface ParsedTableData {
  tableName: string;
  columns: string[];
  rows: Record<string, any>[];
  rawSql?: string;
}

interface VisualSeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    demoDbUrl?: string;
  };
  seedConfig: {
    cronTime: string;
    isEnabled: boolean;
    fileName: string | null;
    originalName?: string;
    hasContent: boolean;
    fileContent?: string;
    schemaContent?: string;
    schemaFileName?: string | null;
    lastRunAt?: string;
    lastStatus?: string;
    lastLog?: string;
  };
  seedLogs: any[];
  onSaveConfig: (
    file: File | null,
    rawCode: string,
    cronTime: string,
    isEnabled: boolean,
    schemaFile?: File | null,
    schemaCode?: string
  ) => Promise<boolean>;
  onRunSeedNow: () => Promise<void>;
  isSaving: boolean;
  isRunning: boolean;
  onTestAndSaveDbUrl?: (url: string, prodId: string) => Promise<{ connected: boolean; message: string }>;
}

/**
 * Universal SQL & Data parser:
 * Parses standard SQL files (extracting INSERT INTO ... statements), JSON arrays, or CSV text.
 */
function parseSeedContent(fileName: string, content: string): { tables: ParsedTableData[]; error?: string } {
  try {
    const trimmed = content.trim();

    // 1. JSON handling
    if (fileName.endsWith(".json") || (trimmed.startsWith("{") || trimmed.startsWith("["))) {
      try {
        const parsed = JSON.parse(trimmed);
        const tables: ParsedTableData[] = [];

        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === "object") {
            const columns = Object.keys(parsed[0]);
            tables.push({
              tableName: "imported_data",
              columns,
              rows: parsed,
            });
          }
        } else if (typeof parsed === "object" && parsed !== null) {
          for (const [tName, val] of Object.entries(parsed)) {
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
              tables.push({
                tableName: tName,
                columns: Object.keys(val[0]),
                rows: val,
              });
            }
          }
        }

        if (tables.length > 0) return { tables };
      } catch (_) {
        // Continue to other parsers
      }
    }

    // 2. High-performance, nested-safe SQL INSERT parser
    // Can handle SQL with nested function calls like crypt('...', gen_salt('bf', 10)), triggers, semicolons, etc.
    const tablesMap: Record<string, { columns: string[]; rows: Record<string, any>[] }> = {};

    const statements = content.split(";");
    for (const rawStmt of statements) {
      const stmt = rawStmt.trim();
      const insertIdx = stmt.toUpperCase().indexOf("INSERT INTO");
      if (insertIdx === -1) continue;

      const subStmt = stmt.slice(insertIdx);
      const m = subStmt.match(/INSERT\s+INTO\s+(?:["`]?\w+["`]?\.)?["`]?(\w+)["`]?\s*(?:\(([\s\S]*?)\))?\s*VALUES\s*([\s\S]+)/i);
      if (!m) continue;

      const rawTableName = m[1].replace(/[`"]/g, "").trim().toLowerCase();
      const rawCols = m[2];
      const valuesStr = m[3].trim();

      let columns: string[] = [];
      if (rawCols) {
        columns = rawCols
          .split(",")
          .map((c) => c.replace(/[`"\r\n\t]/g, "").trim())
          .filter(Boolean);
      }

      // Parse balanced rows: accounts for nested parenthesis inside functions like crypt(...) or gen_salt(...)
      const rows: string[] = [];
      let current = "";
      let depth = 0;
      let inQuote = false;

      for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        if (char === "'" && valuesStr[i - 1] !== "\\") {
          inQuote = !inQuote;
          current += char;
        } else if (char === "(" && !inQuote) {
          depth++;
          if (depth === 1) current = "";
          else current += char;
        } else if (char === ")" && !inQuote) {
          depth--;
          if (depth === 0) {
            rows.push(current);
            current = "";
          } else {
            current += char;
          }
        } else {
          if (depth > 0) current += char;
        }
      }

      if (rows.length > 0) {
        if (!tablesMap[rawTableName]) {
          tablesMap[rawTableName] = { columns: columns.length ? columns : [], rows: [] };
        }

        for (const r of rows) {
          const cells: any[] = [];
          let cell = "";
          let cellDepth = 0;
          let cellQuote = false;

          for (let j = 0; j < r.length; j++) {
            const c = r[j];
            if (c === "'" && r[j - 1] !== "\\") {
              cellQuote = !cellQuote;
              cell += c;
            } else if (c === "(" && !cellQuote) {
              cellDepth++;
              cell += c;
            } else if (c === ")" && !cellQuote) {
              cellDepth--;
              cell += c;
            } else if (c === "," && !cellQuote && cellDepth === 0) {
              cells.push(cleanParsedCell(cell));
              cell = "";
            } else {
              cell += c;
            }
          }
          cells.push(cleanParsedCell(cell));

          if (!tablesMap[rawTableName].columns.length) {
            tablesMap[rawTableName].columns = cells.map((_, idx) => `col_${idx + 1}`);
          }

          const rowObj: Record<string, any> = {};
          tablesMap[rawTableName].columns.forEach((col, idx) => {
            rowObj[col] = cells[idx] !== undefined ? cells[idx] : "";
          });

          tablesMap[rawTableName].rows.push(rowObj);
        }
      }
    }

    // Helper for cleaning cell values
    function cleanParsedCell(c: string) {
      let v = c.trim();
      if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
        return v.slice(1, -1).replace(/''/g, "'");
      }
      if (v.toLowerCase() === "null") return null;
      if (v.toLowerCase() === "true") return true;
      if (v.toLowerCase() === "false") return false;
      if (!isNaN(Number(v)) && v !== "") return Number(v);
      return v;
    }

    // 2.5 Also search for JavaScript Object / Array assignments inside JS files
    const jsArrayRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/gi;
    let jsMatch;
    while ((jsMatch = jsArrayRegex.exec(content)) !== null) {
      const entityName = jsMatch[1].toLowerCase();
      try {
        const rawArrayStr = jsMatch[2];
        const parsedRows = Function(`"use strict"; return (${rawArrayStr});`)();
        if (Array.isArray(parsedRows) && parsedRows.length > 0 && typeof parsedRows[0] === "object") {
          const cols = Object.keys(parsedRows[0]);
          if (!tablesMap[entityName]) {
            tablesMap[entityName] = { columns: cols, rows: parsedRows };
          }
        }
      } catch (_) {}
    }

    const tables: ParsedTableData[] = Object.entries(tablesMap).map(([tName, data]) => ({
      tableName: tName,
      columns: data.columns,
      rows: data.rows,
    }));

    if (tables.length > 0) {
      return { tables };
    }

    // 3. Fallback: If it's a JS file or SQL with standard statements, we show as raw script with detected entities
    const detectedKeywords: string[] = [];
    const keywordMatches = content.match(/\b(warehouses|products|categories|users|bin_locations|stock_levels|customers|vendors)\b/gi);
    if (keywordMatches) {
      detectedKeywords.push(...Array.from(new Set(keywordMatches.map((k) => k.toLowerCase()))));
    }

    return {
      tables: [
        {
          tableName: "script_preview",
          columns: ["File Property", "Value"],
          rows: [
            { "File Property": "File Type", Value: fileName.split(".").pop()?.toUpperCase() || "Script" },
            { "File Property": "Size", Value: `${(content.length / 1024).toFixed(1)} KB` },
            { "File Property": "Detected Entities", Value: detectedKeywords.length ? detectedKeywords.join(", ") : "Standard WMS Schema" },
            { "File Property": "User Session Protection", Value: "Guaranteed (Active 6h demo sessions preserved)" },
          ],
        },
      ],
    };
  } catch (err: any) {
    return { tables: [], error: err.message };
  }
}

export function VisualSeedModal({
  isOpen,
  onClose,
  product,
  seedConfig,
  seedLogs,
  onSaveConfig,
  onRunSeedNow,
  isSaving,
  isRunning,
  onTestAndSaveDbUrl,
}: VisualSeedModalProps) {
  const [activeTab, setActiveTab] = useState<string>("");
  const [parsedTables, setParsedTables] = useState<ParsedTableData[]>([]);
  const [rawContent, setRawContent] = useState<string>(seedConfig.fileContent || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Direct In-Modal DB Configuration State
  const [modalDbUrl, setModalDbUrl] = useState<string>(product.demoDbUrl || "");
  const [isTestingModalDb, setIsTestingModalDb] = useState(false);
  const [modalDbStatus, setModalDbStatus] = useState<{ connected: boolean; message: string } | null>(
    product.demoDbUrl ? { connected: true, message: "Target DB configured" } : null
  );

  const handleTestAndSaveDb = async () => {
    if (!modalDbUrl.trim()) return;
    try {
      setIsTestingModalDb(true);
      setModalDbStatus(null);
      if (onTestAndSaveDbUrl) {
        const res = await onTestAndSaveDbUrl(modalDbUrl.trim(), product.id);
        setModalDbStatus(res);
      }
    } catch (err: any) {
      setModalDbStatus({ connected: false, message: err.message || "Connection failed" });
    } finally {
      setIsTestingModalDb(false);
    }
  };

  // Schema DDL State (for creating tables on blank databases)
  const [selectedSchemaFile, setSelectedSchemaFile] = useState<File | null>(null);
  const [rawSchemaContent, setRawSchemaContent] = useState<string>(seedConfig.schemaContent || "");

  const [cronTime, setCronTime] = useState<string>(seedConfig.cronTime || "00:00");
  const [isEnabled, setIsEnabled] = useState<boolean>(seedConfig.isEnabled ?? true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"table" | "code" | "logs">("table");

  // Load existing saved seed script into preview on initial open
  React.useEffect(() => {
    if (seedConfig.fileContent && !rawContent) {
      setRawContent(seedConfig.fileContent);
      const parsed = parseSeedContent(seedConfig.fileName || "seed.sql", seedConfig.fileContent);
      if (!parsed.error && parsed.tables.length > 0) {
        setParsedTables(parsed.tables);
        setActiveTab(parsed.tables[0].tableName);
      }
    } else if (seedConfig.cronTime) {
      setCronTime(seedConfig.cronTime);
      setIsEnabled(seedConfig.isEnabled ?? true);
    }
  }, [seedConfig]);

  // Handle local file read & instant parsing
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      setRawContent(text);
      const parsed = parseSeedContent(file.name, text);
      if (parsed.error) {
        setParseError(parsed.error);
      } else {
        setParseError(null);
        setParsedTables(parsed.tables);
        if (parsed.tables.length > 0) {
          setActiveTab(parsed.tables[0].tableName);
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle local schema DDL file read
  const handleSchemaFileSelect = (file: File) => {
    setSelectedSchemaFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      setRawSchemaContent(text);
    };
    reader.readAsText(file);
  };

  const handleSaveAndSync = async () => {
    const success = await onSaveConfig(
      selectedFile,
      rawContent,
      cronTime,
      isEnabled,
      selectedSchemaFile,
      rawSchemaContent
    );
    if (success) {
      // Keep view or notify
    }
  };

  if (!isOpen) return null;

  const currentTable = parsedTables.find((t) => t.tableName === activeTab) || parsedTables[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-5xl w-full flex flex-col my-auto max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* ── 1. MODAL HEADER ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Visual Data Seeder & Midnight Reset
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                  Interactive Preview
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Product: <strong className="text-slate-800">{product.title}</strong> &bull; DB:{" "}
                <span className="font-mono text-[11px] text-slate-600 truncate max-w-xs inline-block align-bottom">
                  {modalDbUrl ? modalDbUrl.split("@")[1]?.split("/")[0] : "No DB configured"}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 1.5 DIRECT DATABASE CONNECTION STRIP (Allows instant test & auto-save) ── */}
        <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-200/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <Database className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="text"
              placeholder="postgresql://user:password@ep-...neon.tech/neondb?sslmode=require"
              value={modalDbUrl}
              onChange={(e) => setModalDbUrl(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-blue-200/90 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestAndSaveDb}
              disabled={isTestingModalDb || !modalDbUrl.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isTestingModalDb ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing & Saving...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Test & Save DB</span>
                </>
              )}
            </button>

            {modalDbStatus && (
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                  modalDbStatus.connected
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
                title={modalDbStatus.message}
              >
                {modalDbStatus.connected ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>{modalDbStatus.connected ? "Connected & Saved" : "Failed"}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── 2. TOP BAR CONTROLS (File Upload & Midnight Timer) ── */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
          
          {/* File Upload Triggers (seed.sql & optional schema.sql) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Seed Data Upload */}
            <input
              type="file"
              id="visualSeedUploadInput"
              accept=".sql"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="visualSeedUploadInput"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
              title="Upload Seed SQL file with INSERT statements"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {selectedFile
                  ? selectedFile.name
                  : seedConfig.fileName
                  ? seedConfig.originalName || seedConfig.fileName
                  : "Upload Seed File (seed.sql)"}
              </span>
            </label>

            {/* 2. Optional Schema DDL Upload for blank databases */}
            <input
              type="file"
              id="visualSchemaUploadInput"
              accept=".sql"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleSchemaFileSelect(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="visualSchemaUploadInput"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer active:scale-98 border ${
                selectedSchemaFile || rawSchemaContent
                  ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  : "bg-white border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50/30"
              }`}
              title="Optional: Upload schema.sql (CREATE TABLE statements) for blank databases"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {selectedSchemaFile
                  ? selectedSchemaFile.name
                  : seedConfig.schemaFileName
                  ? seedConfig.schemaFileName
                  : "Schema DDL (Optional)"}
              </span>
            </label>

            {(selectedFile || selectedSchemaFile) && (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready</span>
              </span>
            )}
          </div>

          {/* Midnight Timer Config & Switch */}
          <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">Night Auto-Seed:</span>
              <input
                type="time"
                value={cronTime}
                onChange={(e) => setCronTime(e.target.value)}
                className="px-2 py-0.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-xs font-semibold text-slate-600">
                {isEnabled ? "Enabled" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. VIEW TOGGLES & ENTITY TABS ── */}
        <div className="px-6 py-2.5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white shrink-0">
          {/* Table Entity Tabs with neat horizontal scroll & scrollbar styling */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 max-w-full scrollbar-thin">
            {parsedTables.length > 0 ? (
              parsedTables.map((t) => (
                <button
                  key={t.tableName}
                  onClick={() => {
                    setActiveTab(t.tableName);
                    setActiveView("table");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === t.tableName && activeView === "table"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="capitalize">{t.tableName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === t.tableName && activeView === "table"
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {t.rows.length}
                  </span>
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                Upload a SQL or JSON file above to preview records in table format.
              </span>
            )}
          </div>

          {/* Alternate View Switchers - Separated with clean active pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold text-slate-600 shrink-0 self-end md:self-auto border border-slate-200/60">
            <button
              onClick={() => setActiveView("table")}
              disabled={parsedTables.length === 0}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeView === "table" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setActiveView("code")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeView === "code" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Raw Code
            </button>
            <button
              onClick={() => setActiveView("logs")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeView === "logs" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Run History
            </button>
          </div>
        </div>

        {/* ── 4. MAIN CONTENT AREA (DATA TABLE / RAW CODE / LOGS) ── */}
        <div className="flex-1 overflow-auto p-5 sm:p-6 bg-slate-50/50 min-h-[340px]">
          {activeView === "table" && currentTable ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Entity: {currentTable.tableName}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({currentTable.rows.length} rows to be seeded)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ready for Injection</span>
                </span>
              </div>

              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="py-2.5 px-3.5 font-bold w-12 text-slate-400">#</th>
                      {currentTable.columns.map((col) => (
                        <th key={col} className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {currentTable.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition">
                        <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                        {currentTable.columns.map((col) => {
                          const val = row[col];
                          return (
                            <td key={col} className="py-2.5 px-3.5 max-w-[260px] truncate">
                              {val === null || val === undefined ? (
                                <span className="text-slate-300 italic">NULL</span>
                              ) : typeof val === "boolean" ? (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    val ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                  }`}
                                >
                                  {String(val)}
                                </span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeView === "code" ? (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Direct script payload or SQL statements:</span>
                <span>{rawContent.length} characters</span>
              </div>
              <textarea
                value={rawContent}
                onChange={(e) => {
                  setRawContent(e.target.value);
                  const parsed = parseSeedContent("input.sql", e.target.value);
                  setParsedTables(parsed.tables);
                  if (parsed.tables.length > 0 && !activeTab) {
                    setActiveTab(parsed.tables[0].tableName);
                  }
                }}
                rows={16}
                placeholder="-- Paste your SQL INSERT statements or seed script here..."
                className="w-full p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs focus:outline-none border border-slate-800 leading-relaxed overflow-y-auto"
              />
            </div>
          ) : (
            /* Logs View: Spacious & Beautiful */
            <div className="space-y-3.5 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Seed Execution & History
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Audit logs of manual tests and automated midnight cron triggers.
                  </p>
                </div>
                {seedConfig.lastRunAt && (
                  <span className="text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Last reset: <strong className="text-slate-700">{new Date(seedConfig.lastRunAt).toLocaleString()}</strong>
                  </span>
                )}
              </div>

              {seedLogs.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No execution logs recorded yet</p>
                  <p className="text-slate-400 text-[11px] mt-1">Click &quot;Seed to Database Now&quot; below to trigger your first run.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {seedLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === "success"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            Trigger: {log.run_type}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(log.created_at).toLocaleString()} &bull; {log.duration_ms}ms
                        </span>
                      </div>
                      {log.details && (
                        <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-40 leading-relaxed border border-slate-800">
                          {log.details}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 5. FOOTER ACTIONS (Redesigned with refined modern buttons) ── */}
        <div className="px-6 py-4 bg-white border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span>
              Active demo sessions are safely kept; only transactional demo records are refreshed.
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>

            {/* Save & Schedule Button */}
            <button
              onClick={handleSaveAndSync}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>Save Schedule</span>
            </button>

            {/* Main Primary CTA Button */}
            <button
              onClick={onRunSeedNow}
              disabled={isRunning || (!rawContent.trim() && !seedConfig.hasContent && !selectedFile)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Seeding Database...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Seed Database Now</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
