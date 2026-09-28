"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CREST_GROUPS } from "@/lib/crest/clubs";
import {
  DEFAULT_ALPHA,
  RIVAL_ALPHA,
  arrivalSummary,
  cluster,
  colourMap,
  rankClubs,
} from "@/lib/crest/engine";
import styles from "./CrestSwipe.module.css";

const GROUP_LABEL = {
  England: "England",
  Germany: "Germany",
  France: "France",
  Spain: "Spain",
  "Rest of the World": "Rest of the world",
};

const FAMILY_LABEL = {
  red: "red",
  blue: "blue",
  "sky blue": "sky blue",
  black: "black",
  yellow: "yellow",
  green: "green",
  orange: "orange",
  purple: "purple",
  pink: "pink",
  brown: "brown",
};

const FAMILY_SWATCH = {
  red: "#C8102E",
  blue: "#1C4E9D",
  "sky blue": "#6CABDD",
  black: "#111111",
  yellow: "#F2C400",
  green: "#0E7A3E",
  orange: "#F58025",
  purple: "#5B2A86",
  pink: "#E88FB4",
  brown: "#5A3A2A",
};

/**
 * Whole-percent fit for display. Engine `score` is the geometric-mean
 * per-weight probability of the answers: 50 is coin-flip, 100 is a perfect
 * match. Mapping coin-flip to 0 made mixed hands look empty.
 *
 * @param {number} score
 */
function percent(score) {
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

/**
 * @param {{
 *   answers: import("@/lib/crest/engine").CrestAnswer[],
 *   group: string|null,
 *   onRestart: () => void,
 * }} props
 */
export default function CrestArrival({ answers, group, onRestart }) {
  const [colour, setColour] = useState(null);
  const [rivalEyes, setRivalEyes] = useState(false);
  const alpha = rivalEyes ? RIVAL_ALPHA : DEFAULT_ALPHA;
  const options = useMemo(() => ({ group, colour }), [group, colour]);

  const summary = useMemo(() => arrivalSummary(answers, alpha, options), [answers, alpha, options]);
  const blood = useMemo(() => cluster(summary.ranked).slice(0, 4), [summary]);
  const rows = useMemo(() => colourMap(answers, alpha, { group }), [answers, alpha, group]);
  const perGroup = useMemo(
    () =>
      group
        ? []
        : CREST_GROUPS.map((g) => ({ group: g, best: rankClubs(answers, alpha, { group: g, colour })[0] })),
    [answers, alpha, group, colour],
  );

  const { club, score, confident, runnerUp, greenFlags, rub, ranked } = summary;
  const place = [club.city, club.country].filter(Boolean).join(", ");

  return (
    <section className={styles.arrival}>
      <p className={styles.kicker}>{confident ? "Your club" : "You sit between two"}</p>

      <div className={styles.arrivalBand} style={{ "--club": club.color || "#D8232A" }}>
        <h1 className={styles.arrivalName}>{club.name}</h1>
        <p className={styles.arrivalMeta}>
          {place}
          {club.founded ? ` · ${club.founded}` : ""}
          {club.home ? ` · ${club.home}` : ""}
        </p>
        <p className={styles.arrivalScore}>
          {percent(score)}% agreement
          {colour ? ` · wearing ${FAMILY_LABEL[colour]}` : ""}
          {rivalEyes ? " · through rival eyes" : ""}
        </p>
      </div>

      {!confident && runnerUp ? (
        <div className={styles.arrivalBand} style={{ "--club": runnerUp.color || "#F2EDE4" }}>
          <h2 className={styles.arrivalNameSecond}>{runnerUp.name}</h2>
          <p className={styles.arrivalMeta}>
            {[runnerUp.city, runnerUp.country].filter(Boolean).join(", ")}
          </p>
        </div>
      ) : null}

      {club.selfLine ? (
        <blockquote className={styles.line}>
          <span className={styles.lineWho}>How they see themselves</span>
          {club.selfLine}
        </blockquote>
      ) : null}
      {club.othersLine ? (
        <blockquote className={styles.line}>
          <span className={styles.lineWho}>How the game sees them</span>
          {club.othersLine}
        </blockquote>
      ) : null}

      <div className={styles.flags}>
        {greenFlags.map((flag) => (
          <div key={flag.card.id} className={styles.flag}>
            <span className={styles.flagTag}>Shared</span>
            <strong>{flag.card.question}</strong>
            <span>You both: {flag.clubPhrase}.</span>
          </div>
        ))}
        {rub ? (
          <div className={`${styles.flag} ${styles.flagRub}`}>
            <span className={styles.flagTag}>The rub</span>
            <strong>{rub.card.question}</strong>
            <span>
              You: {rub.userPhrase}. Them: {rub.clubPhrase}.
            </span>
          </div>
        ) : null}
      </div>

      {blood.length > 1 ? (
        <p className={styles.blood}>
          Same blood: {blood.map((c) => c.name).join(", ")}.
        </p>
      ) : null}

      <h2 className={styles.subhead}>If you bleed a colour</h2>
      <p className={styles.hintLeft}>
        Values cannot always split clubs of the same blood. Colour can. Tap a colour to re-rank.
      </p>
      <ul className={styles.colourRows}>
        {rows.map((row) => (
          <li key={row.family}>
            <button
              type="button"
              className={`${styles.colourRow} ${colour === row.family ? styles.colourRowActive : ""}`}
              onClick={() => setColour(colour === row.family ? null : row.family)}
              aria-pressed={colour === row.family}
            >
              <span className={styles.swatch} style={{ background: FAMILY_SWATCH[row.family] }} />
              <span className={styles.colourName}>{FAMILY_LABEL[row.family]}</span>
              <span className={styles.colourClubs}>{row.clubs.map((r) => r.club.name).join(", ")}</span>
            </button>
          </li>
        ))}
      </ul>

      <h2 className={styles.subhead}>Close behind</h2>
      <ol className={styles.ranking}>
        {ranked.slice(1, 6).map(({ club: c, score: s }) => (
          <li key={c.slug}>
            <span className={styles.rankDot} style={{ background: c.color || "#F2EDE4" }} />
            <span className={styles.rankName}>{c.name}</span>
            <span className={styles.rankPct}>{percent(s)}%</span>
          </li>
        ))}
      </ol>

      {perGroup.length ? (
        <>
          <h2 className={styles.subhead}>Closest in each league</h2>
          <ul className={styles.groups}>
            {perGroup.map(({ group: g, best }) => (
              <li key={g}>
                <span className={styles.groupName}>{GROUP_LABEL[g]}</span>
                <span className={styles.rankName}>{best.club.name}</span>
                <span className={styles.rankPct}>{percent(best.score)}%</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <button
        type="button"
        className={`${styles.toggle} ${rivalEyes ? styles.toggleOn : ""}`}
        onClick={() => setRivalEyes(!rivalEyes)}
        aria-pressed={rivalEyes}
      >
        {rivalEyes ? "Back to the club's own voice" : "See your match through rival eyes"}
      </button>

      <div className={styles.next}>
        <button type="button" className={styles.primary} onClick={onRestart}>
          Swipe again
        </button>
        <Link href="/guesser" className={styles.secondary}>
          Play The Guesser
        </Link>
        <Link href="/films" className={styles.secondary}>
          Watch the films
        </Link>
      </div>
    </section>
  );
}
