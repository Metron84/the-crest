/**
 * Validate an exported club file.
 * Run: node scripts/validate-clubs.mjs research/all-clubs.json
 *
 * New clubs are the slugs in research/rest-of-world-ready.json.
 * Existing clubs are reported and left unchanged.
 */

import { readFileSync } from "node:fs";

const SCALE = new Set([-1, -0.6, -0.3, 0, 0.3, 0.6, 1]);
const REGIONS = ["England", "Germany", "Italy", "Spain", "France", "Rest of the World"];
const SUBS = new Set(["Rest of Europe", "Arab world"]);
const FAMILIES = new Set(["red", "blue", "sky blue", "black", "yellow", "green", "orange", "purple", "pink", "brown"]);

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate-clubs.mjs research/all-clubs.json");
  process.exit(1);
}

const clubs = JSON.parse(readFileSync(file, "utf8"));
const ready = JSON.parse(readFileSync(new URL("../research/rest-of-world-ready.json", import.meta.url), "utf8"));
const fresh = new Set(ready.map((club) => club.slug));

const seen = new Set();
const buckets = {
  new: { errors: 0, warnings: 0 },
  existing: { errors: 0, warnings: 0 },
};

for (const club of clubs) {
  const kind = fresh.has(club.slug) ? "new" : "existing";
  const errors = [];
  const warnings = [];

  for (const key of ["slug", "name", "country", "division", "region", "league"]) {
    if (!club[key] || typeof club[key] !== "string") errors.push(`missing ${key}`);
  }
  if (club.league && club.division && club.league !== club.division) errors.push("league and division differ");
  if (!REGIONS.includes(club.region)) errors.push(`bad region ${club.region}`);
  if (club.region === "Rest of the World") {
    if (!SUBS.has(club.subregion)) errors.push(`bad subregion ${club.subregion}`);
  } else if (club.subregion) {
    errors.push(`subregion on ${club.region}`);
  }
  if (seen.has(club.slug)) errors.push("duplicate slug");
  if (club.slug) seen.add(club.slug);

  checkVector("self", club.self, errors);
  checkVector("others", club.others, errors);
  checkMask("selfMask", club.selfMask, errors);
  checkMask("othersMask", club.othersMask, errors);
  if (Array.isArray(club.self) && Array.isArray(club.selfMask) && club.self.length === club.selfMask.length) {
    club.self.forEach((value, i) => {
      if (club.selfMask[i] === false && value !== 0) warnings.push(`self ${i} masked but ${value}`);
    });
  }
  if (Array.isArray(club.others) && Array.isArray(club.othersMask) && club.others.length === club.othersMask.length) {
    club.others.forEach((value, i) => {
      if (club.othersMask[i] === false && value !== 0) warnings.push(`others ${i} masked but ${value}`);
    });
  }

  if (typeof club.confidence !== "number" || !(club.confidence > 0) || club.confidence > 1) {
    errors.push(`bad confidence ${club.confidence}`);
  }
  if (!Array.isArray(club.families)) errors.push("families missing");
  else {
    if (!club.families.length) warnings.push("no families");
    for (const family of club.families) {
      if (typeof family !== "string" || family !== family.toLowerCase()) errors.push(`family not lowercase ${family}`);
      else if (family === "white" || family === "claret") errors.push(`family ${family}`);
      else if (!FAMILIES.has(family)) warnings.push(`unknown family ${family}`);
    }
  }

  if (club.founded == null) warnings.push("founded missing");
  if (!club.city) warnings.push("city missing");
  if (!club.stadium) warnings.push("stadium missing");
  if (!club.colours) warnings.push("colours missing");
  if (!club.color) warnings.push("color missing");
  if (!club.selfLine) warnings.push("selfLine missing");
  if (!club.othersLine) warnings.push("othersLine missing");

  if (errors.length) {
    buckets[kind].errors += errors.length;
    console.log(`ERROR ${kind} ${club.slug}: ${errors.join("; ")}`);
  }
  if (warnings.length) {
    buckets[kind].warnings += warnings.length;
    if (kind === "new") console.log(`WARN ${kind} ${club.slug}: ${warnings.join("; ")}`);
  }
}

console.log(
  `new clubs: ${buckets.new.errors} errors, ${buckets.new.warnings} warnings`,
);
console.log(
  `existing clubs: ${buckets.existing.errors} errors, ${buckets.existing.warnings} warnings`,
);
if (buckets.new.errors) process.exit(1);

/**
 * @param {string} name
 * @param {unknown} values
 * @param {string[]} errors
 */
function checkVector(name, values, errors) {
  if (!Array.isArray(values) || values.length !== 12) {
    errors.push(`${name} length`);
    return;
  }
  if (values.some((value) => !SCALE.has(value))) errors.push(`${name} off scale`);
  if (values.filter((value) => Math.abs(value) === 1).length > 5) errors.push(`${name} more than five poles`);
}

/**
 * @param {string} name
 * @param {unknown} values
 * @param {string[]} errors
 */
function checkMask(name, values, errors) {
  if (!Array.isArray(values) || values.length !== 12 || values.some((value) => typeof value !== "boolean")) {
    errors.push(`${name} length`);
  }
}
