import type { Session, User } from "better-auth";

const SESSION_KEY = "session";

export type SessionData = {
  session: Session;
  user: User;
};

export const getCachedSession = () => {
  const cached = localStorage.getItem(SESSION_KEY);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as SessionData;
  } catch {
    return null;
  }
};

export const setCachedSession = (session: SessionData) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const isSessionValid = (session: SessionData): boolean => {
  if (!session.session?.expiresAt) return false;
  return new Date(session.session.expiresAt) > new Date();
};
