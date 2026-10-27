/**
 * Export research/all-clubs.json from the live club list.
 * Run: node scripts/export-clubs.mjs
 */

import { writeFileSync } from "node:fs";
import { CLUBS } from "../lib/crest/clubs.js";

const rows = CLUBS.map((club) => {
  const row = {
    slug: club.slug,
    name: club.name,
    league: club.league || club.division || club.competition,
    country: club.country,
    city: club.city ?? null,
    stadium: club.stadium || club.home || null,
    founded: club.founded ?? null,
    colours: club.colours ?? null,
    families: club.families || club.colourFamilies || [],
    color: club.color ?? null,
    confidence: club.confidence,
    self: club.self,
    selfMask: club.selfMask,
    others: club.others,
    othersMask: club.othersMask,
    selfLine: club.selfLine ?? null,
    othersLine: club.othersLine ?? null,
    division: club.division || club.league || club.competition,
    region: club.region,
  };
  if (club.region === "Rest of the World") row.subregion = club.subregion || null;
  if (club.arabicLine) row.arabicLine = club.arabicLine;
  return row;
});

writeFileSync(new URL("../research/all-clubs.json", import.meta.url), JSON.stringify(rows, null, 2) + "\n");
console.log(`wrote ${rows.length} clubs`);
