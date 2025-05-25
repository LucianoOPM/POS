import { User } from "@/types/user";
import { invoke } from "@tauri-apps/api/core";

export const loginFunction = async (user: {
  username: string;
  password: string;
}): Promise<User> => {
  return await invoke("login", { userData: user });
};

export const getSession = async (): Promise<User | null> => {
  return await invoke("get_session");
};
