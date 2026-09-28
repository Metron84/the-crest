/**
 * Review sheet for the fan-swipe law. Does not stamp clubs.js.
 *
 * Walks time (old ground / new bowl) and philosophy (sack / keep faith)
 * against the notes. Flags a row when the notes talk like the terrace
 * and the number still looks like the inventory.
 *
 *   node scripts/crest-fan-swipe-review.mjs
 *
 * Writes scripts/crest-fan-swipe-review.csv. Lock ticks in that sheet
 * before any restamp.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CLUBS } from "../lib/crest/clubs.js";
import { blend } from "../lib/crest/engine.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const notes = JSON.parse(readFileSync(join(ROOT, "../data/crest/club-notes.json"), "utf8"));
const TIME = 9;
const PHILOSOPHY = 7;

const TIME_TERRACE =
  /\b(upton|boleyn|highbury|vetch|plough lane|old ground|intimacy|intimate|authenticity|cartuja|relocation|boleyn memories)\b/i;
const TIME_BOWL = /\b(new stadium|modern stadium|60,?000|emirates|london stadium|commercial scale|bowl)\b/i;
const SACK = /\b(sack|sacking|managerial shift|managerial shifts|churn|protest|protests|board anger|collapse)\b/i;
const FAITH = /\b(keep faith|continuity|backing the team|patience|bubbles|optimism in adversity)\b/i;

function csv(value) {
  const text = String(value ?? "").replaceAll('"', '""').replaceAll(/\s+/g, " ").trim();
  return `"${text}"`;
}

function masked(club, voice, facet) {
  const mask = voice === "self" ? club.selfMask : club.othersMask;
  if (!mask) return false;
  return !mask[facet];
}

const rows = [
  [
    "slug",
    "name",
    "facet",
    "self",
    "others",
    "others_masked",
    "blend",
    "flag",
    "lock",
    "self_note",
    "others_note",
  ].join(","),
];

let flagged = 0;

for (const club of CLUBS) {
  const pack = notes[club.slug] || { self: [], others: [] };
  const rooms = [
    {
      facet: "time",
      index: TIME,
      terrace: TIME_TERRACE,
      inventory: TIME_BOWL,
      inventoryPole: (v) => v > 0,
    },
    {
      facet: "philosophy",
      index: PHILOSOPHY,
      terrace: SACK,
      inventory: FAITH,
      inventoryPole: (v) => v > 0,
    },
  ];

  for (const room of rooms) {
    const selfNote = pack.self?.[room.index] || "";
    const othersNote = pack.others?.[room.index] || "";
    const text = `${(pack.self || []).join(" ")} ${(pack.others || []).join(" ")}`;
    const othersMasked = masked(club, "others", room.index);
    const mixed = blend(club, room.index);
    const terraceTalk = room.terrace.test(text);
    const inventoryTalk = room.inventory.test(text);
    const looksLikeInventory = room.inventoryPole(mixed) || (room.facet === "philosophy" && othersMasked);
    const flag = terraceTalk && looksLikeInventory ? "review" : "";
    if (flag) flagged++;
    rows.push(
      [
        csv(club.slug),
        csv(club.name),
        room.facet,
        club.self[room.index],
        club.others[room.index],
        othersMasked ? "yes" : "no",
        mixed.toFixed(2),
        flag,
        "",
        csv(selfNote),
        csv(othersNote),
      ].join(","),
    );
    void inventoryTalk;
  }
}

const out = join(ROOT, "crest-fan-swipe-review.csv");
writeFileSync(out, `${rows.join("\n")}\n`);
console.log(`wrote ${out}`);
console.log(`clubs: ${CLUBS.length}`);
console.log(`flagged for lock: ${flagged}`);
console.log("No vectors were changed.");
