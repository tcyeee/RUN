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
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs font-medium tracking-wide text-ink-soft">
            <tr>
              <th className="whitespace-nowrap px-4 py-3"></th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  title={c.hint}
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 transition-colors hover:text-brand"
                >
                  {c.label}
                  {sortKey === c.key ? (asc ? " ▲" : " ▼") : ""}
                </th>
              ))}
              <th className="whitespace-nowrap px-4 py-3">永居</th>
              <th className="whitespace-nowrap px-4 py-3">入籍</th>
              <th className="whitespace-nowrap px-4 py-3">保留原国籍</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.slug}
                className="border-t border-black/5 transition-colors hover:bg-canvas/60"
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(c.slug)}
                    onChange={() => toggleSelect(c.slug)}
                    className="accent-brand"
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">{c.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.col ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.rent ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.safety ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.tax ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.salary ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                  {c.passport ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.pr}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.cit}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.dual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compared.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-tight text-ink">
            对比（已选 {compared.length} 个）
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {compared.map((c) => (
              <div
                key={c.slug}
                className="rounded-2xl border border-brand/15 bg-brand/5 p-5 shadow-sm"
              >
                <div className="mb-3 font-semibold tracking-tight text-ink">
                  {c.name}
                </div>
                <dl className="space-y-1.5 text-sm text-ink-soft">
                  <div className="flex justify-between">
                    <dt>生活成本</dt>
                    <dd className="text-ink">{c.col ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>最高个税</dt>
                    <dd className="text-ink">{c.tax ?? "—"}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>永居</dt>
                    <dd className="text-ink">{c.pr}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>入籍</dt>
                    <dd className="text-ink">{c.cit}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>语言</dt>
                    <dd className="text-ink">{c.lang}</dd>
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
