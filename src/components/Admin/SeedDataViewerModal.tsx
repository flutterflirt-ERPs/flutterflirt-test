"use client";

import React, { useState } from "react";
import { X, Table, ShieldCheck, AlertCircle } from "lucide-react";

export interface ParsedTableData {
  tableName: string;
  columns: string[];
  rows: Record<string, any>[];
  rawSql?: string;
}

interface SeedDataViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: string; // The SQL content (seed or DDL)
}

/**
 * Universal SQL & Data parser:
 * Parses standard SQL files (extracting INSERT INTO ... statements), JSON arrays, or CSV text.
 */
function parseContent(content: string): { tables: ParsedTableData[]; error?: string } {
  try {
    const trimmed = content.trim();
    if (!trimmed) return { tables: [] };

    // 1. JSON handling
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        const tables: ParsedTableData[] = [];

        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === "object") {
            const columns = Object.keys(parsed[0]);
            tables.push({
              tableName: "records",
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
      } catch (_) {}
    }

    // 2. High-performance, nested-safe SQL INSERT parser
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

    const tables: ParsedTableData[] = Object.entries(tablesMap).map(([tName, data]) => ({
      tableName: tName,
      columns: data.columns,
      rows: data.rows,
    }));

    if (tables.length > 0) {
      return { tables };
    }

    // If CREATE TABLE DDL is present
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["`]?\w+["`]?\.)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\);/gi;
    let createMatch;
    const ddlTables: ParsedTableData[] = [];
    while ((createMatch = createTableRegex.exec(content)) !== null) {
      const tblName = createMatch[1];
      const body = createMatch[2];
      const colLines = body.split(",").map((l) => l.trim()).filter((l) => !l.toUpperCase().startsWith("CONSTRAINT") && !l.toUpperCase().startsWith("PRIMARY KEY") && !l.toUpperCase().startsWith("FOREIGN KEY"));
      const cols = colLines.map((l) => l.split(/\s+/)[0].replace(/[`"]/g, "")).filter(Boolean);
      ddlTables.push({
        tableName: tblName,
        columns: ["Column Name", "Definition"],
        rows: colLines.map((l) => {
          const parts = l.split(/\s+/);
          return {
            "Column Name": parts[0].replace(/[`"]/g, ""),
            "Definition": parts.slice(1).join(" ")
          };
        })
      });
    }

    if (ddlTables.length > 0) {
      return { tables: ddlTables };
    }

    return { tables: [] };
  } catch (err: any) {
    return { tables: [], error: err.message };
  }
}

export function SeedDataViewerModal({
  isOpen,
  onClose,
  title = "Database Records & Entities",
  content
}: SeedDataViewerModalProps) {
  const [activeTab, setActiveTab] = useState<string>("");

  const { tables, error } = React.useMemo(() => parseContent(content), [content]);

  React.useEffect(() => {
    if (tables.length > 0 && (!activeTab || !tables.find((t) => t.tableName === activeTab))) {
      setActiveTab(tables[0].tableName);
    }
  }, [tables, activeTab]);

  if (!isOpen) return null;

  const currentTable = tables.find((t) => t.tableName === activeTab) || tables[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-4xl w-full flex flex-col my-auto max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header: Title, Entity Tabs & ONLY 'X' Close button */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{title}</h2>
              <p className="text-[11px] text-slate-500">
                {tables.length > 0
                  ? `${tables.length} table${tables.length > 1 ? "s" : ""} detected`
                  : "Previewing table rows"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Tabs (if multiple tables detected) */}
        {tables.length > 1 && (
          <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-200/70 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
            {tables.map((t) => (
              <button
                key={t.tableName}
                onClick={() => setActiveTab(t.tableName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === t.tableName
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Table className="w-3 h-3" />
                <span className="capitalize">{t.tableName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === t.tableName
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t.rows.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Content Table Area */}
        <div className="flex-1 overflow-auto p-5 sm:p-6 bg-slate-50/50 min-h-[300px]">
          {currentTable && currentTable.rows.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {currentTable.tableName} ({currentTable.rows.length} records)
                </span>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Parsed</span>
                </span>
              </div>

              <div className="overflow-x-auto max-h-[50vh]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="py-2 px-3 font-bold w-10 text-slate-400">#</th>
                      {currentTable.columns.map((col) => (
                        <th key={col} className="py-2 px-3 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {currentTable.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                        {currentTable.columns.map((col) => {
                          const val = row[col];
                          return (
                            <td key={col} className="py-2 px-3 max-w-[260px] truncate">
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
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">No structured records detected</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                Ensure your SQL contains valid INSERT INTO or CREATE TABLE statements to display records in tabular format.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
