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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索国家或路线名…"
          className="w-56 rounded-full border border-black/10 bg-canvas px-4 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
        <div className="flex flex-wrap gap-1.5">
          {routeTypes.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                types.has(t)
                  ? "border-ink bg-ink text-white"
                  : "border-black/10 bg-white text-ink-soft hover:border-ink/30 hover:text-ink"
              }`}
            >
              {routeTypeLabel[t]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={familyOnly}
            onChange={(e) => setFamilyOnly(e.target.checked)}
            className="accent-brand"
          />
          仅看支持家属
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
            className="accent-brand"
          />
          仅看开放中
        </label>
        <span className="ml-auto text-sm text-ink-soft">
          共 {filtered.length} / {programmes.length} 条
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs font-medium tracking-wide text-ink-soft">
            <tr>
              <th className="whitespace-nowrap px-4 py-3">国家</th>
              <th className="whitespace-nowrap px-4 py-3">路线</th>
              <th className="whitespace-nowrap px-4 py-3">类型</th>
              <th className="whitespace-nowrap px-4 py-3">门槛</th>
              <th className="whitespace-nowrap px-4 py-3">永居</th>
              <th className="whitespace-nowrap px-4 py-3">家属</th>
              <th className="whitespace-nowrap px-4 py-3">状态</th>
              <th className="sticky right-0 whitespace-nowrap bg-canvas px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.slug}
                className="group border-t border-black/5 transition-colors hover:bg-canvas/60"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                  {p.country}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink">{p.programme}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                  {routeTypeLabel[p.route_type]}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{p.threshold}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{p.pr}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{p.family}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.status === "open"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-black/5 text-ink-soft"
                    }`}
                  >
                    {p.status === "open" ? "开放" : "关闭"}
                  </span>
                </td>
                <td className="sticky right-0 whitespace-nowrap bg-white px-4 py-3 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)] group-hover:bg-canvas/60">
                  <a
                    href={p.letsmigrate}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand hover:underline"
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
