"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PART_LABEL, TOTAL } from "@/lib/crest/cards";
import { DEFAULT_ALPHA, nextCard } from "@/lib/crest/engine";
import SwipeCard from "./SwipeCard";
import CrestArrival from "./CrestArrival";
import CrestHome, { readStoredScope, writeStoredScope } from "./CrestHome";
import CrestReport from "./CrestReport";
import styles from "./CrestSwipe.module.css";

/**
 * The Crest. Pick where to look, swipe twenty cards, arrive at a club.
 * Answers live in component state for the session only.
 * On the TRF site the chrome already has a header and footer, so the
 * in-game tab bar is hidden (`embedded`).
 *
 * @param {{embedded?: boolean}} [props]
 */
export default function CrestSwipe({ embedded = false }) {
  const [step, setStep] = useState("scope");
  const [group, setGroup] = useState(null);
  const [colour, setColour] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    setGroup(readStoredScope());
  }, []);

  const current = useMemo(
    () => (step === "play" ? nextCard(answers, DEFAULT_ALPHA, { group }) : null),
    [answers, group, step],
  );

  const onDrag = useCallback((value) => setDrag(value), []);

  function setScope(next) {
    setGroup(next);
    writeStoredScope(next);
  }

  function start() {
    setColour(null);
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
    setColour(null);
    setDrag(0);
    setStep("scope");
  }

  if (step === "report") {
    return (
      <div className={styles.board}>
        <CrestReport
          answers={answers}
          group={group}
          colour={colour}
          onBack={() => setStep("arrival")}
          onRestart={restart}
        />
        {embedded ? null : <TabBar />}
      </div>
    );
  }

  if (step === "arrival") {
    return (
      <div className={styles.board}>
        <CrestArrival
          answers={answers}
          group={group}
          colour={colour}
          onColour={setColour}
          onOpenReport={() => setStep("report")}
          onRestart={restart}
        />
        {embedded ? null : <TabBar />}
      </div>
    );
  }

  if (step === "scope" || !current) {
    return (
      <>
        <CrestHome
          group={group}
          onScope={setScope}
          onStart={start}
          backHref={embedded ? "/games" : null}
        />
        {embedded ? null : (
          <div className={styles.board}>
            <TabBar />
          </div>
        )}
      </>
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
      {embedded ? null : <TabBar />}
    </div>
  );
}

function TabBar() {
  return (
    <nav className={styles.tabbar} aria-label="Site">
      <Link href="/">Home</Link>
      <Link href="/games">Games</Link>
      <Link href="/account">Account</Link>
    </nav>
  );
}
