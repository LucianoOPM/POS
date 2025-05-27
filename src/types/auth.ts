export type AuthState = {
  isAuthenticated: boolean;
  session: Session | null;
  login: (loginData: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  setSession: () => Promise<void>;
};

export type LoginData = {
  username: string;
  password: string;
};

export type Session = {
  username: string;
  role: "ADMIN" | "USER";
  email: string;
};
