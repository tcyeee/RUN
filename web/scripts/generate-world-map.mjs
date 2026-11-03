// Regenerates src/data/world-map.json from world-atlas (Natural Earth 50m).
// Run with: node scripts/generate-world-map.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import rawTopology from "world-atlas/countries-50m.json" with { type: "json" };
import * as topojsonClient from "topojson-client";
import * as topojsonSimplify from "topojson-simplify";

// Natural Earth country name -> our country slug, for every country this
// project has structured data for (Europe profiles + global destinations).
// Everything else gets an auto-generated slug and renders as an inert,
// unmatched country on the map.
const NAME_TO_SLUG = {
  Albania: "albania",
  Andorra: "andorra",
  Austria: "austria",
  Belgium: "belgium",
  Bulgaria: "bulgaria",
  Croatia: "croatia",
  Cyprus: "cyprus",
  Czechia: "czechia",
  Denmark: "denmark",
  Estonia: "estonia",
  Finland: "finland",
  France: "france",
  Germany: "germany",
  Greece: "greece",
  Hungary: "hungary",
  Iceland: "iceland",
  Ireland: "ireland",
  Italy: "italy",
  Latvia: "latvia",
  Liechtenstein: "liechtenstein",
  Lithuania: "lithuania",
  Luxembourg: "luxembourg",
  Malta: "malta",
  Montenegro: "montenegro",
  Netherlands: "netherlands",
  Norway: "norway",
  Poland: "poland",
  Portugal: "portugal",
  Romania: "romania",
  Slovakia: "slovakia",
  Slovenia: "slovenia",
  Spain: "spain",
  Sweden: "sweden",
  Switzerland: "switzerland",
  Turkey: "turkiye",
  "United Kingdom": "united-kingdom",
  // Global destinations
  "United States of America": "usa",
  Canada: "canada",
  Australia: "australia",
  "New Zealand": "new-zealand",
  Japan: "japan",
  "South Korea": "south-korea",
  Singapore: "singapore",
  "Hong Kong": "hong-kong",
  Philippines: "philippines",
  Thailand: "thailand",
  Malaysia: "malaysia",
  "United Arab Emirates": "uae",
  Mexico: "mexico",
  Panama: "panama",
  Argentina: "argentina",
};

function autoSlug(name) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Simplify at a fidelity tuned for the small on-page map (~800x500px); this
// cuts the shipped payload drastically without visibly degrading country shapes.
const presimplified = topojsonSimplify.presimplify(rawTopology);
const topology = topojsonSimplify.simplify(presimplified, 0.03);

const geo = topojsonClient.feature(topology, topology.objects.countries);

for (const f of geo.features) {
  const name = f.properties.name;
  f.properties = { slug: NAME_TO_SLUG[name] ?? autoSlug(name), name };
}

const out = { type: "FeatureCollection", features: geo.features };
const outPath = fileURLToPath(
  new URL("../src/data/world-map.json", import.meta.url),
);
writeFileSync(outPath, JSON.stringify(out));
console.log(`Wrote ${geo.features.length} features to ${outPath}`);
