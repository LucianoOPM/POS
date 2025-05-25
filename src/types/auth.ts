import { User } from "./user";

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => void;
};
