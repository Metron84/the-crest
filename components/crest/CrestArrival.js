"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DEFAULT_ALPHA, arrivalSummary, colourMap } from "@/lib/crest/engine";
import { buildReport, matchPercent } from "@/lib/crest/report";
import styles from "./CrestSwipe.module.css";

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
 * @param {{
 *   answers: import("@/lib/crest/engine").CrestAnswer[],
 *   group: string|null,
 *   colour: string|null,
 *   onColour: (family: string|null) => void,
 *   onOpenReport: () => void,
 *   onRestart: () => void,
 * }} props
 */
export default function CrestArrival({
  answers,
  group,
  colour,
  onColour,
  onOpenReport,
  onRestart,
}) {
  const options = useMemo(() => ({ group, colour }), [group, colour]);
  const summary = useMemo(() => arrivalSummary(answers, DEFAULT_ALPHA, options), [answers, options]);
  const rows = useMemo(() => colourMap(answers, DEFAULT_ALPHA, { group }), [answers, group]);
  const report = useMemo(() => buildReport({ answers, group, colour }, "blend"), [answers, group, colour]);

  const { club, score, confident, runnerUp, greenFlags, rub } = summary;
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
          {matchPercent(score)}% agreement
          {colour ? ` · wearing ${FAMILY_LABEL[colour]}` : ""}
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
              onClick={() => onColour(colour === row.family ? null : row.family)}
              aria-pressed={colour === row.family}
            >
              <span className={styles.swatch} style={{ background: FAMILY_SWATCH[row.family] }} />
              <span className={styles.colourName}>{FAMILY_LABEL[row.family]}</span>
              <span className={styles.colourClubs}>{row.clubs.map((r) => r.club.name).join(", ")}</span>
            </button>
          </li>
        ))}
      </ul>

      {report ? (
        <div className={styles.reportCard}>
          <p className={styles.reportKicker}>The report</p>
          <h2 className={styles.reportTitle}>Why this club, and where you part.</h2>
          <p className={styles.reportOpener}>{report.opener}</p>
          <button type="button" className={styles.reportButton} onClick={onOpenReport}>
            Read the full report
            <ArrowRight />
          </button>
        </div>
      ) : null}

      <div className={styles.next}>
        <button type="button" className={styles.again} onClick={onRestart}>
          Swipe again
        </button>
        <div className={styles.nextPair}>
          <Link href="/guesser" className={styles.nextGhost}>
            Play The Guesser
          </Link>
          <Link href="/films" className={styles.nextGhost}>
            Watch the films
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M7 3.5 12.5 9 7 14.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
