import { invoke } from "@tauri-apps/api/core";
import type { UserFilter, UserListResponse, UserRecord, Profile, NewUser, UpdateUser } from "@/types";

export const userActions = {
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    status?: boolean
  ): Promise<UserListResponse> => {
    const filters: UserFilter = { page, limit, status };
    return await invoke<UserListResponse>("get_users", { filters });
  },

  toggleUserStatus: async (userId: string): Promise<UserRecord> => {
    return await invoke<UserRecord>("toggle_user_status", { userId });
  },

  getProfiles: async (): Promise<Profile[]> => {
    return await invoke<Profile[]>("get_profiles");
  },

  createUser: async (userData: NewUser): Promise<UserRecord> => {
    return await invoke<UserRecord>("create_user", { userData });
  },

  updateUser: async (userId: string, updateData: UpdateUser): Promise<UserRecord> => {
    return await invoke<UserRecord>("update_user", { userId, updateData });
  },
};
