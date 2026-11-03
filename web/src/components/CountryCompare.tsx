import { useMemo, useState } from "react";
import { countries, type CountryProfile } from "../data/countries";

type SortKey = "name" | "col" | "rent" | "safety" | "tax" | "salary" | "passport";

const columns: { key: SortKey; label: string; hint: string }[] = [
  { key: "name", label: "国家", hint: "" },
  { key: "col", label: "生活成本", hint: "纽约=100" },
  { key: "rent", label: "房租", hint: "纽约=100" },
  { key: "safety", label: "安全指数", hint: "越高越安全" },
  { key: "tax", label: "最高个税 %", hint: "" },
  { key: "salary", label: "平均年薪 EUR", hint: "" },
  { key: "passport", label: "护照免签数", hint: "" },
];

function sortValue(c: CountryProfile, key: SortKey): number | string {
  const v = c[key as keyof CountryProfile];
  if (v === null || v === undefined) return key === "name" ? "" : Infinity;
  return v as number | string;
}

export default function CountryCompare() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    const list = [...countries];
    list.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (typeof av === "string" || typeof bv === "string") {
        return String(av).localeCompare(String(bv), "zh") * (asc ? 1 : -1);
      }
      return (av - bv) * (asc ? 1 : -1);
    });
    return list;
  }, [sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((a) => !a);
    else {
      setSortKey(key);
      setAsc(true);
    }
  }

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  const compared = countries.filter((c) => selected.has(c.slug));

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2"></th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  title={c.hint}
                  className="cursor-pointer select-none px-3 py-2 hover:text-teal-600"
                >
                  {c.label}
                  {sortKey === c.key ? (asc ? " ▲" : " ▼") : ""}
                </th>
              ))}
              <th className="px-3 py-2">永居</th>
              <th className="px-3 py-2">入籍</th>
              <th className="px-3 py-2">保留原国籍</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.slug}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(c.slug)}
                    onChange={() => toggleSelect(c.slug)}
                  />
                </td>
                <td className="px-3 py-2 font-medium text-slate-800">
                  {c.name}
                </td>
                <td className="px-3 py-2 text-slate-500">{c.col ?? "—"}</td>
                <td className="px-3 py-2 text-slate-500">{c.rent ?? "—"}</td>
                <td className="px-3 py-2 text-slate-500">{c.safety ?? "—"}</td>
                <td className="px-3 py-2 text-slate-500">{c.tax ?? "—"}</td>
                <td className="px-3 py-2 text-slate-500">{c.salary ?? "—"}</td>
                <td className="px-3 py-2 text-slate-500">{c.passport ?? "—"}</td>
                <td className="px-3 py-2 text-slate-500">{c.pr}</td>
                <td className="px-3 py-2 text-slate-500">{c.cit}</td>
                <td className="px-3 py-2 text-slate-500">{c.dual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compared.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            对比（已选 {compared.length} 个）
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {compared.map((c) => (
              <div
                key={c.slug}
                className="rounded-lg border border-teal-200 bg-teal-50/40 p-4"
              >
                <div className="mb-2 font-semibold text-slate-800">
                  {c.name}
                </div>
                <dl className="space-y-1 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <dt>生活成本</dt>
                    <dd>{c.col ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>最高个税</dt>
                    <dd>{c.tax ?? "—"}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>永居</dt>
                    <dd>{c.pr}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>入籍</dt>
                    <dd>{c.cit}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>语言</dt>
                    <dd>{c.lang}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
