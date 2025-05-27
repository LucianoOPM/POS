import { LoginData, Session } from "@/types/auth";
import { invoke } from "@tauri-apps/api/core";

export const loginFunction = async (
  sessionData: LoginData
): Promise<Session> => {
  return await invoke("login", { userData: sessionData });
};

export const getSession = async (): Promise<Session | null> => {
  return await invoke("get_session");
};

export const logoutFunction = async (): Promise<void> => {
  return await invoke("logout");
};
