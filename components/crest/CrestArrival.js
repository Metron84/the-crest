"use client";

import { useEffect, useMemo, useState } from "react";
import { APP_VERSION, SITE_URL } from "@/lib/config";
import { DEFAULT_ALPHA, arrivalSummary } from "@/lib/crest/engine";
import { buildOutcome } from "@/lib/crest/outcome";
import { CONFIDENT_ROOM_PCT } from "@/lib/crest/report";
import { encodeResume } from "@/lib/crest/resume";
import { crestSaveHref, crestSignupHref } from "@/lib/crest/signup";
import { logFinishedRun } from "@/lib/crest/runLog";
import { cardDataFrom, renderShareCard, shareCard, shareKicker } from "@/lib/crest/shareCard";
import styles from "./CrestSwipe.module.css";

/**
 * Result screen. Born to comes from roots. Built for comes from the swipes.
 *
 * @param {{
 *   answers: import("@/lib/crest/engine").CrestAnswer[],
 *   group: string|null,
 *   stake?: string|null,
 *   roots?: import("@/lib/crest/roots").CrestRoots|null,
 *   runId?: number,
 *   onRestart: () => void,
 * }} props
 */
export default function CrestArrival({ answers, group, stake = null, roots = null, runId = 0, onRestart }) {
  const [ready, setReady] = useState(false);
  const [shareState, setShareState] = useState("idle");

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(id);
  }, []);

  const outcome = useMemo(
    () => buildOutcome(answers, { group, stake, roots }),
    [answers, group, stake, roots],
  );
  const summary = useMemo(
    () => arrivalSummary(answers, DEFAULT_ALPHA, { group, stake }),
    [answers, group, stake],
  );

  useEffect(() => {
    if (!runId || !outcome.built) return;
    logFinishedRun(runId, {
      appVersion: APP_VERSION,
      scope: group,
      stake,
      roots,
      answers,
      built: outcome.built,
      runnerUp: outcome.runnerUp,
      born: outcome.born,
      regions: outcome.countries.flatMap((country) =>
        country.leagues.map((league) => ({
          region: league.label,
          top: league.top,
        })),
      ),
    });
  }, [runId, outcome, group, stake, roots, answers]);

  const built = outcome.built;
  const born = outcome.born;
  const hero = heroOf(outcome);
  const heroSlug = hero?.slug || null;

  function leave(href) {
    if (!ready || !href) return;
    window.location.assign(href);
  }

  async function shareResult() {
    if (!ready || shareState === "busy" || !built) return;
    setShareState("busy");
    try {
      const kicker = shareKicker(built.percentage, !outcome.closeCall);
      const blob = await renderShareCard(cardDataFrom(summary, built.percentage, kicker));
      const shareName = hero?.name || built.name;
      const result = await shareCard(blob, shareName);
      setShareState(result === "saved" ? "saved" : "idle");
    } catch {
      setShareState("idle");
    }
  }

  function saveResults() {
    if (!ready || !built) return;
    try {
      leave(
        crestSaveHref(
          encodeResume({
            answers,
            stake,
            scope: group,
            version: APP_VERSION,
            roots,
            born,
            built,
            runnerUp: outcome.runnerUp,
            rows: outcome.regions,
          }),
        ),
      );
    } catch {
      leave(crestSignupHref(built.slug));
    }
  }

  if (!built) return null;

  const filmsHref = `${SITE_URL}/films`;
  const joinHref = crestSignupHref(heroSlug || built.slug);

  return (
    <section className={styles.arrival}>
      <ResultCards outcome={outcome} />

      {outcome.closeCall && outcome.runnerUp ? (
        <p className={styles.line}>
          Close call: {outcome.runnerUp.name} is right behind at {outcome.runnerUp.percentage}%.
        </p>
      ) : null}

      {outcome.deciding.length && outcome.runnerUp ? (
        <div className={styles.flags}>
          <h2 className={styles.subhead}>What decided it over {outcome.runnerUp.name}</h2>
          {outcome.deciding.map((row) => (
            <div key={row.id} className={styles.flag}>
              <strong>{row.question}</strong>
              <span>{row.answer}</span>
            </div>
          ))}
        </div>
      ) : null}

      <h2 className={styles.subhead}>Your club in every league</h2>
      {outcome.countries.map((country) => (
        <section key={country.country}>
          <h3 className={styles.colourName}>{country.country}</h3>
          <ul className={styles.leagueList}>
            {country.leagues.map((league) => {
              const hit = league.top?.slug && league.top.slug === heroSlug;
              return (
                <li key={league.competition}>
                  <div className={`${styles.leagueRow} ${hit ? styles.leagueRowOn : ""}`}>
                    <span>{league.label}</span>
                    <strong>{league.top ? league.top.name : "No clubs in this league yet"}</strong>
                    <span>{league.top ? `${league.top.percentage}%` : ""}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className={styles.next}>
        <button type="button" className={styles.saveCta} onClick={saveResults} disabled={!ready}>
          Save your results
        </button>
        <button
          type="button"
          className={styles.again}
          onClick={shareResult}
          disabled={!ready || shareState === "busy"}
        >
          {shareState === "saved" ? "Card saved, link copied" : "Share your FC"}
        </button>
        <button type="button" className={styles.again} onClick={onRestart}>
          Swipe again
        </button>
        <div className={styles.nextPair}>
          <button type="button" className={styles.nextGhost} onClick={() => leave(joinHref)} disabled={!ready}>
            Join The Reflective Football
          </button>
          <button type="button" className={styles.nextGhost} onClick={() => leave(filmsHref)} disabled={!ready}>
            Watch the films
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * @param {{ outcome: ReturnType<typeof buildOutcome> }} props
 */
function ResultCards({ outcome }) {
  const { built, born } = outcome;
  if (!built) return null;

  if (!born) {
    const label = built.percentage >= CONFIDENT_ROOM_PCT ? "Your FC" : "Closest match";
    return <ClubCard label={label} name={built.name} color={built.color} percentage={built.percentage} />;
  }

  if (born.typed) {
    return (
      <>
        <div className={styles.resultPair}>
          <ClubCard label="Born to" name={born.name} color={born.color} note="Not on our list yet" />
          <ClubCard label="Built for" name={built.name} color={built.color} percentage={built.percentage} />
        </div>
        <p className={styles.line}>We can&apos;t score {born.name} yet, so your swipes decide.</p>
      </>
    );
  }

  if (outcome.same) {
    return (
      <ClubCard
        label="Your FC, by blood and by heart"
        name={built.name}
        color={built.color}
        percentage={built.percentage}
      />
    );
  }

  const line =
    outcome.leanWinner === "born"
      ? `Your roots outweigh your swipes, so ${born.name} stays home.`
      : `Your swipes outweigh your roots, so ${built.name} is where you fit.`;

  return (
    <>
      <div className={styles.resultPair}>
        <ClubCard label="Born to" name={born.name} color={born.color} percentage={born.percentage} />
        <ClubCard label="Built for" name={built.name} color={built.color} percentage={built.percentage} />
      </div>
      <p className={styles.line}>{line}</p>
    </>
  );
}

/**
 * @param {{ label: string, name: string, color?: string|null, percentage?: number|null, note?: string }} props
 */
function ClubCard({ label, name, color, percentage, note }) {
  return (
    <div className={styles.arrivalBand} style={{ "--club": color || "#D8232A" }}>
      <p className={styles.resultLabel}>{label}</p>
      <h1 className={styles.arrivalName}>{name}</h1>
      {note ? <p className={styles.arrivalMeta}>{note}</p> : null}
      {percentage != null ? <p className={styles.arrivalScore}>{percentage}% match</p> : null}
    </div>
  );
}

/**
 * The club the screen is treating as the answer.
 *
 * @param {ReturnType<typeof buildOutcome>} outcome
 */
function heroOf(outcome) {
  if (!outcome.built) return null;
  if (!outcome.born || outcome.born.typed || outcome.same || outcome.noRoots) return outcome.built;
  if (outcome.leanWinner === "born") return outcome.born;
  return outcome.built;
}
