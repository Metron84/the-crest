"use client";

import styles from "./RegionBoard.module.css";

/** One card per region, highest match first. */
export default function RegionBoard({ results }) {
  if (!results?.regions?.length) return null;

  return (
    <ul className={styles.grid}>
      {results.regions.map((row) => {
        const wide = row.region === "Rest of the World";
        return (
          <li key={row.region} className={wide ? `${styles.card} ${styles.wide}` : styles.card}>
            <p className={styles.label}>{row.label}</p>
            {wide ? (
              <ol className={styles.rank}>
                {row.ranked.map((club, index) => (
                  <li key={club.slug}>
                    <span className={styles.pos}>{index + 1}</span>
                    {club.flag ? (
                      <span className={styles.flag} aria-hidden="true">
                        {club.flag}
                      </span>
                    ) : null}
                    <span className={styles.who}>
                      <strong>{club.name}</strong>
                      <small>{[club.country, club.league].filter(Boolean).join(" · ")}</small>
                    </span>
                    <span className={styles.pct}>{club.percentage}%</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className={styles.lead}>
                <h3>{row.top.name}</h3>
                <p>
                  {row.top.flag && row.top.country !== row.region ? (
                    <span className={styles.flag} aria-hidden="true">
                      {row.top.flag}{" "}
                    </span>
                  ) : null}
                  {[
                    row.top.country !== row.region ? row.top.country : null,
                    row.top.city,
                    row.top.league,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className={styles.pct}>{row.top.percentage}%</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
