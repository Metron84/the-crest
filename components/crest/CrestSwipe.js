"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { PART_LABEL, TOTAL } from "@/lib/crest/cards";
import { CLUBS, CREST_GROUPS } from "@/lib/crest/clubs";
import { nextCard } from "@/lib/crest/engine";
import SwipeCard from "./SwipeCard";
import CrestArrival from "./CrestArrival";
import styles from "./CrestSwipe.module.css";

const GROUP_LABEL = {
  England: "England",
  Germany: "Germany",
  France: "France",
  Spain: "Spain",
  "Rest of the World": "Rest of the world",
};

/**
 * The Crest. Pick where to look, swipe twenty cards, arrive at a club.
 * Answers live in component state for the session only.
 */
export default function CrestSwipe() {
  const [step, setStep] = useState("scope");
  const [group, setGroup] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [drag, setDrag] = useState(0);

  const counts = useMemo(() => {
    const map = { all: CLUBS.length };
    for (const g of CREST_GROUPS) map[g] = CLUBS.filter((c) => c.group === g).length;
    return map;
  }, []);

  const current = useMemo(
    () => (step === "play" ? nextCard(answers, 0.6, { group }) : null),
    [answers, group, step],
  );

  const onDrag = useCallback((value) => setDrag(value), []);

  function begin(selected) {
    setGroup(selected);
    setAnswers([]);
    setStep("play");
  }

  function answer(side) {
    if (!current) return;
    const value = side === "left" ? current.card.leftValue : -current.card.leftValue;
    const next = [...answers, { cardId: current.card.id, value }];
    setDrag(0);
    setAnswers(next);
    if (next.length >= TOTAL) setStep("arrival");
  }

  function back() {
    if (answers.length === 0) {
      setStep("scope");
      return;
    }
    setAnswers(answers.slice(0, -1));
    setDrag(0);
  }

  function restart() {
    setAnswers([]);
    setDrag(0);
    setStep("scope");
  }

  if (step === "arrival") {
    return (
      <div className={styles.board}>
        <CrestArrival answers={answers} group={group} onRestart={restart} />
        <TabBar />
      </div>
    );
  }

  if (step === "scope" || !current) {
    return (
      <div className={styles.board}>
        <header className={styles.topbar}>
          <Link href="https://thereflectivefootball.com/games" className={styles.iconButton} aria-label="Back to games">
            &larr;
          </Link>
          <span className={styles.topbarTitle}>The Crest</span>
          <span className={styles.iconButton} aria-hidden="true" />
        </header>

        <section className={styles.scope}>
          <p className={styles.kicker}>Twenty cards. One club.</p>
          <h1 className={styles.question}>Where should we look for your club?</h1>
          <p className={styles.hint}>
            Every club is scored on how it sees itself and how the game sees it. Your swipes
            find the one that sounds like you.
          </p>
          <div className={styles.scopeGrid}>
            <button type="button" className={styles.scopeButton} onClick={() => begin(null)}>
              <span>Everywhere</span>
              <small>{counts.all} clubs</small>
            </button>
            {CREST_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                className={styles.scopeButton}
                onClick={() => begin(g)}
              >
                <span>{GROUP_LABEL[g]}</span>
                <small>{counts[g]} clubs</small>
              </button>
            ))}
          </div>
        </section>
        <TabBar />
      </div>
    );
  }

  const index = answers.length;
  const card = current.card;
  const percent = Math.round((index / TOTAL) * 100);

  return (
    <div
      className={styles.board}
      style={{
        "--wash-left": Math.max(0, -drag),
        "--wash-right": Math.max(0, drag),
      }}
    >
      <div className={`${styles.wash} ${styles.washLeft}`} aria-hidden="true" />
      <div className={`${styles.wash} ${styles.washRight}`} aria-hidden="true" />

      <header className={styles.topbar}>
        <button type="button" className={styles.iconButton} onClick={back} aria-label="Back">
          &larr;
        </button>
        <span className={styles.topbarTitle}>
          Part {card.part}. {PART_LABEL[card.part]}
        </span>
        <button type="button" className={styles.textButton} onClick={restart}>
          Restart
        </button>
      </header>

      <section className={styles.play} aria-live="polite">
        <h1 className={styles.question}>{card.question}</h1>

        <div className={styles.stage}>
          <span className={`${styles.sideLabel} ${styles.sideLeft}`} aria-hidden="true">
            &larr; {card.left}
          </span>
          <span className={`${styles.sideLabel} ${styles.sideRight}`} aria-hidden="true">
            {card.right} &rarr;
          </span>
          <SwipeCard key={card.id} card={card} index={index} onAnswer={answer} onDrag={onDrag} />
        </div>

        <p className={styles.hint}>
          Swipe the card, tap a side, or use the arrow keys.
          {card.part === 1 ? " Personality cards count half." : ""}
        </p>
      </section>

      <footer className={styles.progress}>
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={index}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <span className={styles.progressLabel}>
          Card {index + 1} of {TOTAL}
        </span>
      </footer>
      <TabBar />
    </div>
  );
}

function TabBar() {
  return (
    <nav className={styles.tabbar} aria-label="Site">
      <Link href="https://thereflectivefootball.com">Home</Link>
      <Link href="https://thereflectivefootball.com/games">Games</Link>
      <Link href="https://thereflectivefootball.com/account">Account</Link>
    </nav>
  );
}
