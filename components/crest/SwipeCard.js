"use client";

import { useRef, useState } from "react";
import { FACETS } from "@/lib/crest/facets";
import { PART_LABEL } from "@/lib/crest/cards";
import styles from "./CrestSwipe.module.css";

const SWIPE_THRESHOLD = 110;
const FLY_MS = 320;

/**
 * One draggable question card. Left drag commits the left answer, right drag
 * the right answer. Buttons under the card do the same by tap and the arrow
 * keys work when the card has focus.
 *
 * @param {{
 *   card: import("@/lib/crest/cards").CrestCard,
 *   index: number,
 *   onAnswer: (side: "left"|"right") => void,
 *   onDrag: (progress: number) => void,
 * }} props
 */
export default function SwipeCard({ card, index, onAnswer, onDrag }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState(null);
  const startX = useRef(0);
  const pointerId = useRef(null);
  const committed = useRef(false);
  const ref = useRef(null);

  const progress = Math.max(-1, Math.min(1, dx / SWIPE_THRESHOLD));

  function commit(side) {
    if (committed.current) return;
    committed.current = true;
    setDragging(false);
    setFlying(side);
    onDrag(side === "left" ? -1 : 1);
    window.setTimeout(() => onAnswer(side), FLY_MS);
  }

  function onPointerDown(event) {
    if (flying) return;
    pointerId.current = event.pointerId;
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging || event.pointerId !== pointerId.current) return;
    const next = event.clientX - startX.current;
    setDx(next);
    onDrag(Math.max(-1, Math.min(1, next / SWIPE_THRESHOLD)));
  }

  function onPointerUp(event) {
    if (!dragging || event.pointerId !== pointerId.current) return;
    setDragging(false);
    if (dx <= -SWIPE_THRESHOLD) commit("left");
    else if (dx >= SWIPE_THRESHOLD) commit("right");
    else {
      setDx(0);
      onDrag(0);
    }
  }

  function onKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      commit("left");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      commit("right");
    }
  }

  const facet = FACETS[card.facet];
  const flyX = flying === "left" ? -1.6 : flying === "right" ? 1.6 : 0;
  const translate = flying ? `${flyX * 100}vw` : `${dx}px`;
  const rotate = flying ? flyX * 18 : dx / 14;
  const transition = dragging
    ? "none"
    : flying
      ? `transform ${FLY_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1), opacity ${FLY_MS}ms ease`
      : "transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1.2)";

  return (
    <div className={styles.cardWrap}>
      <div
        ref={ref}
        className={styles.card}
        role="group"
        aria-label={`Card ${index + 1}. ${card.question}`}
        tabIndex={0}
        style={{
          transform: `translateX(${translate}) rotate(${rotate}deg)`,
          transition,
          opacity: flying ? 0 : 1,
          cursor: dragging ? "grabbing" : "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className={styles.cardArt} data-facet={facet.key} aria-hidden="true">
          <span className={styles.cardArtGroup}>{facet.group}</span>
          <span className={styles.cardArtLabel}>{facet.label}</span>
          <span className={styles.cardArtNumber}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className={styles.cardFoot}>
          <span>{PART_LABEL[card.part]}</span>
          <span>{facet.left} or {facet.right}</span>
        </div>

        <div
          className={`${styles.stamp} ${styles.stampLeft}`}
          style={{ opacity: Math.max(0, -progress) }}
          aria-hidden="true"
        >
          {card.left}
        </div>
        <div
          className={`${styles.stamp} ${styles.stampRight}`}
          style={{ opacity: Math.max(0, progress) }}
          aria-hidden="true"
        >
          {card.right}
        </div>
      </div>

      <div className={styles.choiceRow}>
        <button
          type="button"
          className={`${styles.choice} ${styles.choiceLeft}`}
          onClick={() => commit("left")}
          disabled={Boolean(flying)}
        >
          <span className={styles.choiceArrow} aria-hidden="true">
            &larr;
          </span>
          <span>{card.left}</span>
        </button>
        <button
          type="button"
          className={`${styles.choice} ${styles.choiceRight}`}
          onClick={() => commit("right")}
          disabled={Boolean(flying)}
        >
          <span>{card.right}</span>
          <span className={styles.choiceArrow} aria-hidden="true">
            &rarr;
          </span>
        </button>
      </div>
    </div>
  );
}
