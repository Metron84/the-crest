"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { allowsBoth, TOTAL } from "@/lib/crest/cards";
import { DEFAULT_ALPHA, nextCard } from "@/lib/crest/engine";
import { EMPTY_ROOTS } from "@/lib/crest/roots";
import { clearCrestRunStorage } from "@/lib/crest/session";
import { getStake } from "@/lib/crest/stakes";
import SwipeCard from "./SwipeCard";
import CrestArrival from "./CrestArrival";
import CrestHome from "./CrestHome";
import CrestReport from "./CrestReport";
import CrestReveal from "./CrestReveal";
import CrestRoots from "./CrestRoots";
import CrestWant from "./CrestWant";
import styles from "./CrestSwipe.module.css";

const RUN_TOTAL = 4 + TOTAL;

/**
 * The Crest. Scope, roots, one want, ten cards, arrival.
 * A new run clears stored scope, answers, stake, and roots.
 *
 * @param {{embedded?: boolean}} [props]
 */
export default function CrestSwipe({ embedded = false }) {
  const [step, setStep] = useState("scope");
  const [group, setGroup] = useState(null);
  const [stake, setStake] = useState(null);
  const [roots, setRoots] = useState(EMPTY_ROOTS);
  const [answers, setAnswers] = useState([]);
  const [drag, setDrag] = useState(0);
  const [runId, setRunId] = useState(0);
  const boardRef = useRef(null);

  useEffect(() => {
    clearCrestRunStorage();
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
  }

  function start() {
    clearCrestRunStorage();
    setAnswers([]);
    setStake(null);
    setRoots(EMPTY_ROOTS);
    setDrag(0);
    setStep("roots");
  }

  function pickStake(id) {
    setStake(id);
    setAnswers([]);
    setDrag(0);
    setStep("play");
  }

  function answer(side) {
    if (!current) return;
    if (side === "both" && !allowsBoth(current.card)) return;
    const value =
      side === "both" ? 0 : side === "left" ? current.card.leftValue : -current.card.leftValue;
    const next = [...answers, { cardId: current.card.id, value }];
    setDrag(0);
    setAnswers(next);
    if (next.length >= TOTAL) {
      setRunId((id) => id + 1);
      setStep("reveal");
    }
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
    clearCrestRunStorage();
    setAnswers([]);
    setStake(null);
    setRoots(EMPTY_ROOTS);
    setGroup(null);
    setDrag(0);
    setStep("scope");
  }

  function onPlayKey(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp") return;
    if (event.key === "ArrowUp" && current && !allowsBoth(current.card)) return;
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

  if (step === "reveal") {
    return (
      <CrestReveal answers={answers} group={group} stake={stake} onDone={() => setStep("arrival")} />
    );
  }

  if (step === "arrival") {
    return (
      <div className={styles.board}>
        <CrestArrival
          answers={answers}
          group={group}
          stake={stake}
          roots={roots}
          runId={runId}
          onRestart={restart}
        />
      </div>
    );
  }

  if (step === "want") {
    return <CrestWant selected={stake} onPick={pickStake} onBack={() => setStep("roots")} />;
  }

  if (step === "roots") {
    return (
      <CrestRoots
        onBack={() => setStep("scope")}
        onDone={(next) => {
          setRoots(next);
          setStep("want");
        }}
      />
    );
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
  const done = 4 + index;
  const percent = Math.round((done / RUN_TOTAL) * 100);
  const stakeName = getStake(stake)?.label || "";

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
            {index + 1} of {TOTAL}
            <span className={styles.chipLine}>{done} of {RUN_TOTAL}</span>
          </span>
          <button type="button" className={styles.restart} onClick={restart}>
            Restart
          </button>
        </div>
        {stakeName ? <p className={styles.stakeTab}>{stakeName}</p> : null}
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={RUN_TOTAL}
          aria-valuenow={done}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </header>

      <section className={styles.play} aria-live="polite">
        <div className={styles.stage}>
          <SwipeCard key={card.id} card={card} index={index} onAnswer={answer} onDrag={onDrag} />
        </div>
      </section>
    </div>
  );
}
