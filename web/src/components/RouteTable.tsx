import { useMemo, useState } from "react";
import {
  programmes,
  routeTypeLabel,
  routeTypes,
  type RouteType,
} from "../data/programmes";

export default function RouteTable() {
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<Set<RouteType>>(new Set());
  const [familyOnly, setFamilyOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(true);

  function toggleType(t: RouteType) {
    setTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programmes
      .filter((p) => (openOnly ? p.status === "open" : true))
      .filter((p) => (types.size === 0 ? true : types.has(p.route_type)))
      .filter((p) => (familyOnly ? p.family.includes("支持") : true))
      .filter((p) =>
        q
          ? p.country.toLowerCase().includes(q) ||
            p.programme.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => a.country.localeCompare(b.country, "zh"));
  }, [query, types, familyOnly, openOnly]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索国家或路线名…"
          className="w-56 rounded border border-slate-300 px-3 py-1.5 text-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          {routeTypes.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                types.has(t)
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-teal-400"
              }`}
            >
              {routeTypeLabel[t]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={familyOnly}
            onChange={(e) => setFamilyOnly(e.target.checked)}
          />
          仅看支持家属
        </label>
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
          />
          仅看开放中
        </label>
        <span className="ml-auto text-sm text-slate-500">
          共 {filtered.length} / {programmes.length} 条
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2">国家</th>
              <th className="px-3 py-2">路线</th>
              <th className="px-3 py-2">类型</th>
              <th className="px-3 py-2">门槛</th>
              <th className="px-3 py-2">永居</th>
              <th className="px-3 py-2">家属</th>
              <th className="px-3 py-2">状态</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.slug}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-3 py-2 font-medium text-slate-800">
                  {p.country}
                </td>
                <td className="px-3 py-2 text-slate-700">{p.programme}</td>
                <td className="px-3 py-2 text-slate-500">
                  {routeTypeLabel[p.route_type]}
                </td>
                <td className="px-3 py-2 text-slate-500">{p.threshold}</td>
                <td className="px-3 py-2 text-slate-500">{p.pr}</td>
                <td className="px-3 py-2 text-slate-500">{p.family}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      p.status === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {p.status === "open" ? "开放" : "关闭"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <a
                    href={p.letsmigrate}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 hover:underline"
                  >
                    详情 →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
