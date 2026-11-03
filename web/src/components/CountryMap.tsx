import { useMemo, useState } from "react";
import { geoNaturalEarth1 } from "d3-geo";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import worldMap from "../data/world-map.json";
import { countries } from "../data/countries";
import { routeTypeLabel, type Programme } from "../data/programmes";

interface CountryMapProps {
  programmes: Programme[];
  title: string;
}

const MAP_WIDTH = 900;
const MAP_HEIGHT = 500;

const profileBySlug = new Map(countries.map((c) => [c.slug, c]));

export default function CountryMap({ programmes, title }: CountryMapProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const projection = useMemo(
    () =>
      geoNaturalEarth1().fitExtent(
        [
          [8, 8],
          [MAP_WIDTH - 8, MAP_HEIGHT - 8],
        ],
        worldMap as GeoJSON.FeatureCollection,
      ),
    [],
  );

  const programmesBySlug = useMemo(() => {
    const map = new Map<string, Programme[]>();
    for (const p of programmes) {
      const list = map.get(p.country_slug);
      if (list) list.push(p);
      else map.set(p.country_slug, [p]);
    }
    return map;
  }, [programmes]);

  const matchedCount = programmesBySlug.size;
  const selectedProfile = selectedSlug ? profileBySlug.get(selectedSlug) : null;
  const selectedProgrammes = selectedSlug
    ? (programmesBySlug.get(selectedSlug) ?? [])
    : [];

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <h3 className="text-sm font-semibold tracking-tight text-ink">
          {title}
        </h3>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
          {matchedCount} 个国家
        </span>
      </div>

      <ComposableMap
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        projection={projection}
        className="w-full"
        style={{ height: "auto" }}
      >
        <Geographies geography={worldMap as GeoJSON.FeatureCollection}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const slug = (geo.properties as { slug: string }).slug;
              const matched = programmesBySlug.has(slug);
              const isSelected = slug === selectedSlug;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() =>
                    setSelectedSlug((prev) => (prev === slug ? null : slug))
                  }
                  className={[
                    "cursor-pointer outline-none transition-colors duration-200",
                    matched
                      ? "[fill:#0a7d72] hover:[fill:#065f56]"
                      : "[fill:#e4e4e7] hover:[fill:#c8c8ce]",
                    isSelected
                      ? "[stroke:#1d1d1f] [stroke-width:1.5px]"
                      : "[stroke:#ffffff] [stroke-width:0.5px]",
                  ].join(" ")}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {selectedProfile && (
        <div className="border-t border-black/5 bg-canvas/60 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold tracking-tight text-ink">
              {selectedProfile.name}
            </h4>
            <button
              onClick={() => setSelectedSlug(null)}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          <dl className="mb-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <div className="flex justify-between rounded-xl bg-white px-3 py-2">
              <dt className="text-ink-soft">最高个税</dt>
              <dd className="text-ink">{selectedProfile.tax ?? "—"}%</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-white px-3 py-2">
              <dt className="text-ink-soft">生活成本</dt>
              <dd className="text-ink">{selectedProfile.col ?? "—"}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-white px-3 py-2">
              <dt className="text-ink-soft">安全指数</dt>
              <dd className="text-ink">{selectedProfile.safety ?? "—"}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-white px-3 py-2">
              <dt className="text-ink-soft">永居</dt>
              <dd className="text-ink">{selectedProfile.pr}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-white px-3 py-2">
              <dt className="text-ink-soft">入籍</dt>
              <dd className="text-ink">{selectedProfile.cit}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-white px-3 py-2">
              <dt className="text-ink-soft">语言</dt>
              <dd className="text-ink">{selectedProfile.lang}</dd>
            </div>
          </dl>

          {selectedProgrammes.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-ink-soft">
                当前筛选下匹配的路线
              </p>
              {selectedProgrammes.map((p) => (
                <div
                  key={p.slug}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-2.5 text-sm"
                >
                  <div>
                    <span className="text-ink">{p.programme}</span>
                    <span className="ml-2 rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-soft">
                      {routeTypeLabel[p.route_type]}
                    </span>
                  </div>
                  <a
                    href={p.letsmigrate}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 font-medium text-brand hover:underline"
                  >
                    详情 →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              当前筛选条件下，{selectedProfile.name} 没有匹配的路线。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
