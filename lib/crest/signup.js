import { SITE_URL } from "@/lib/config";

/**
 * Same-tab sign-up URL for the matched club.
 *
 * @param {string} clubId
 */
export function crestSignupHref(clubId, next = "/crest") {
  const url = new URL("/signin", SITE_URL);
  url.searchParams.set("from", "crest");
  url.searchParams.set("club", clubId);
  url.searchParams.set("next", next);
  return url.toString();
}

/**
 * @param {{answers: {cardId: number, value: 1|0|-1}[], stake?: string|null, scope?: string|null}} ballot
 * @param {string} resumeToken
 */
export function crestSaveHref(resumeToken) {
  const next = `/crest?resume=${resumeToken}`;
  const url = new URL("/signin", SITE_URL);
  url.searchParams.set("from", "crest");
  url.searchParams.set("next", next);
  return url.toString();
}
