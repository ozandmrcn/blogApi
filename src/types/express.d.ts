import type { UserType } from '.';

/**
 * Adds the authenticated user to the global `User` interface so guards and
 * controllers can read `request.user` without casting.
 *
 * `Request.cookies` is intentionally not redeclared here: `cookie-parser`
 * already augments Express with it, and a second declaration placed outside
 * `declare global` would never have merged in the first place.
 */
declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

export {};
