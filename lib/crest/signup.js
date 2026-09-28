import { SITE_URL } from "@/lib/config";

/**
 * Same-tab sign-up URL for the matched club.
 *
 * @param {string} clubId
 */
export function crestSignupHref(clubId) {
  const url = new URL("/signin", SITE_URL);
  url.searchParams.set("from", "crest");
  url.searchParams.set("club", clubId);
  url.searchParams.set("redirect", "/");
  return url.toString();
}
