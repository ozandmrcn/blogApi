/**
 * Claims embedded in both the access and the refresh token.
 */
export interface JwtPayload {
  /**
   * Registered `sub` (subject) claim holding the user's id, as required by
   * RFC 7519. It is the single source of truth used by both strategies.
   */
  sub: string;

  /** Username, carried so guards can identify the caller without a lookup. */
  username: string;
}
