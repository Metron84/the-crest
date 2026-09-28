"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PART_LABEL, TOTAL } from "@/lib/crest/cards";
import { DEFAULT_ALPHA, nextCard } from "@/lib/crest/engine";
import SwipeCard from "./SwipeCard";
import CrestArrival from "./CrestArrival";
import CrestHome, { readStoredScope, writeStoredScope } from "./CrestHome";
import CrestReport from "./CrestReport";
import CrestWant from "./CrestWant";
import styles from "./CrestSwipe.module.css";

/**
 * The Crest. Standalone play: home, one want, eighteen cards, arrival, report.
 * Answers and the chip live in component state for the session only.
 *
 * @param {{embedded?: boolean}} [props]
 */
export default function CrestSwipe({ embedded = false }) {
  const [step, setStep] = useState("scope");
  const [group, setGroup] = useState(null);
  const [stake, setStake] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [drag, setDrag] = useState(0);
  const boardRef = useRef(null);

  useEffect(() => {
    setGroup(readStoredScope());
  }, []);

  const current = useMemo(
    () => (step === "play" ? nextCard(answers, DEFAULT_ALPHA, { group, stake }) : null),
    [answers, group, stake, step],
  );

  const onDrag = useCallback((value) => setDrag(value), []);

  useEffect(() => {
    if (step !== "play") return;
    boardRef.current?.focus({ preventScroll: true });
  }, [step, current?.card?.id]);

  function setScope(next) {
    setGroup(next);
    writeStoredScope(next);
  }

  function start() {
    setAnswers([]);
    setStake(null);
    setStep("want");
  }

  function pickStake(id) {
    setStake(id);
    setAnswers([]);
    setDrag(0);
    setStep("play");
  }

  function answer(side) {
    if (!current) return;
    const value =
      side === "both" ? 0 : side === "left" ? current.card.leftValue : -current.card.leftValue;
    const next = [...answers, { cardId: current.card.id, value }];
    setDrag(0);
    setAnswers(next);
    if (next.length >= TOTAL) setStep("arrival");
  }

  function back() {
    if (answers.length === 0) {
      setStep("want");
      return;
    }
    setAnswers(answers.slice(0, -1));
    setDrag(0);
  }

  function restart() {
    setAnswers([]);
    setStake(null);
    setDrag(0);
    setStep("scope");
  }

  function onPlayKey(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const side = event.key === "ArrowLeft" ? "left" : event.key === "ArrowRight" ? "right" : "both";
    event.currentTarget.querySelector(`[data-choice="${side}"]`)?.click();
  }

  if (step === "report") {
    return (
      <div className={styles.board}>
        <CrestReport
          answers={answers}
          group={group}
          stake={stake}
          colour={null}
          onBack={() => setStep("arrival")}
          onRestart={restart}
        />
      </div>
    );
  }

  if (step === "arrival") {
    return (
      <div className={styles.board}>
        <CrestArrival
          answers={answers}
          group={group}
          stake={stake}
          onOpenReport={() => setStep("report")}
          onRestart={restart}
        />
      </div>
    );
  }

  if (step === "want") {
    return <CrestWant onPick={pickStake} onBack={() => setStep("scope")} />;
  }

  if (step === "scope" || !current) {
    return (
      <CrestHome
        group={group}
        onScope={setScope}
        onStart={start}
        backHref={embedded ? "/games" : null}
      />
    );
  }

  const index = answers.length;
  const card = current.card;
  const percent = Math.round((index / TOTAL) * 100);

  return (
    <div
      ref={boardRef}
      className={styles.board}
      tabIndex={0}
      onKeyDown={onPlayKey}
      style={{
        "--wash-left": Math.max(0, -drag),
        "--wash-right": Math.max(0, drag),
      }}
    >
      <header className={styles.playHead}>
        <div className={styles.playHeadRow}>
          <button type="button" className={styles.iconButton} onClick={back} aria-label="Back">
            &larr;
          </button>
          <span className={styles.partLabel}>
            {card.part} of 3 · {PART_LABEL[card.part]}
          </span>
          <button type="button" className={styles.restart} onClick={restart}>
            Restart
          </button>
        </div>
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={index}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </header>

      <section className={styles.play} aria-live="polite">
        {card.context ? <p className={styles.cardContext}>{card.context}</p> : null}
        <div className={styles.stage}>
          <SwipeCard key={card.id} card={card} index={index} onAnswer={answer} onDrag={onDrag} />
        </div>
      </section>
    </div>
  );
}
