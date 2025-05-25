import { useAuthStore } from "@/stores/useAuthStore";
import { JSX } from "preact/jsx-runtime";
import { Redirect } from "wouter-preact";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAuthStore((state) => state);

  if (!auth.isAuthenticated) {
    return <Redirect to="/auth" />;
  }
  return <div>{children}</div>;
};
