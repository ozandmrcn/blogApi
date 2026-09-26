/**
 * Public shape of a user. The password hash is never part of it — the
 * `password` field is excluded from queries by default and stripped from
 * every response, so it is not something callers can accidentally leak.
 */
type UserType = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Internal shape used only by the login flow, which needs the stored hash in
 * order to compare a submitted password against it.
 */
type UserRecord = UserType & {
  password: string;
};

export type { UserRecord, UserType };
