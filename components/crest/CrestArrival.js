"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CREST_GROUPS } from "@/lib/crest/clubs";
import { arrivalSummary, rankClubs } from "@/lib/crest/engine";
import styles from "./CrestSwipe.module.css";

const GROUP_LABEL = {
  England: "England",
  Germany: "Germany",
  France: "France",
  Spain: "Spain",
  "Rest of the World": "Rest of the world",
};

/**
 * Match strength as a whole percent. Engine scores sit between 0.5 and 1 in
 * practice, so 0.5 reads as 0 and 1 reads as 100.
 *
 * @param {number} score
 */
function percent(score) {
  return Math.round(Math.max(0, Math.min(1, (score - 0.5) * 2)) * 100);
}

/**
 * @param {{
 *   answers: import("@/lib/crest/engine").CrestAnswer[],
 *   group: string|null,
 *   onRestart: () => void,
 * }} props
 */
export default function CrestArrival({ answers, group, onRestart }) {
  const summary = useMemo(() => arrivalSummary(answers, 0.6, { group }), [answers, group]);
  const ranking = useMemo(
    () => rankClubs(answers, 0.6, { group }).slice(0, 6),
    [answers, group],
  );
  const perGroup = useMemo(
    () =>
      group
        ? []
        : CREST_GROUPS.map((g) => ({
            group: g,
            best: rankClubs(answers, 0.6, { group: g })[0],
          })),
    [answers, group],
  );

  const { club, score, greenFlags, rub } = summary;
  const place = [club.city, club.country].filter(Boolean).join(", ");

  return (
    <section className={styles.arrival}>
      <p className={styles.kicker}>Your club</p>
      <div className={styles.arrivalBand} style={{ "--club": club.color || "#D8232A" }}>
        <h1 className={styles.arrivalName}>{club.name}</h1>
        <p className={styles.arrivalMeta}>
          {place}
          {club.founded ? ` · ${club.founded}` : ""}
          {club.home ? ` · ${club.home}` : ""}
        </p>
        <p className={styles.arrivalScore}>{percent(score)}% match</p>
      </div>

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
          <div key={flag.facet.key} className={styles.flag}>
            <span className={styles.flagTag}>Shared</span>
            <strong>{flag.facet.label}</strong>
            <span>{flag.clubPhrase}</span>
          </div>
        ))}
        {rub ? (
          <div className={`${styles.flag} ${styles.flagRub}`}>
            <span className={styles.flagTag}>The rub</span>
            <strong>{rub.facet.label}</strong>
            <span>
              You: {rub.userPhrase}. Them: {rub.clubPhrase}.
            </span>
          </div>
        ) : null}
      </div>

      <h2 className={styles.subhead}>Close behind</h2>
      <ol className={styles.ranking}>
        {ranking.slice(1).map(({ club: c, score: s }) => (
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

      <div className={styles.next}>
        <button type="button" className={styles.primary} onClick={onRestart}>
          Swipe again
        </button>
        <Link href="https://thereflectivefootball.com/guesser" className={styles.secondary}>
          Play The Guesser
        </Link>
        <Link href="https://thereflectivefootball.com/films" className={styles.secondary}>
          Watch the films
        </Link>
      </div>
    </section>
  );
}
