import type { SessionUser } from './session-user';

export interface SessionState {
  isAuthenticated: boolean;
  user: SessionUser | null;
  token: string | null;
}