import { useState, useMemo } from "preact/hooks";
import useSWR from "swr";
import { userActions } from "@/actions/users";
import UsersTable from "./components/UsersTable";
import UsersToolbar from "./components/UsersToolbar";
import UsersStats from "./components/UsersStats";
import UserForm from "./components/UserForm";
import type { UserRecord, UserListResponse } from "@/types";

export default function Index() {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Cargar usuarios del backend con paginación
  const { data, mutate } = useSWR<UserListResponse>(
    ["users", currentPage + 1, pageSize],
    () => userActions.getUsers(currentPage + 1, pageSize)
  );

  const users = data?.users ?? [];
  const totalPages = data?.total_pages ?? 0;

  // Filtrado local por búsqueda
  const filteredUsers: UserRecord[] = useMemo(() => {
    if (!search.trim()) return users;

    const searchLower = search.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        (user.profile_name && user.profile_name.toLowerCase().includes(searchLower))
    );
  }, [users, search]);

  const handleToggleStatus = async (user: UserRecord): Promise<void> => {
    setTogglingUserId(user.id);
    try {
      await userActions.toggleUserStatus(user.id);
      mutate();
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleOpenModal = (user: UserRecord | null = null): void => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleCloseModal = (): void => {
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handlePageSizeChange = (newSize: number): void => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number): void => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* Stats Header */}
      <UsersStats users={users} totalItems={data?.total_items} />

      {/* Toolbar */}
      <UsersToolbar
        search={search}
        onSearchChange={setSearch}
        onCreateNew={() => handleOpenModal()}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Table Area */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <UsersTable
          users={filteredUsers}
          onEditUser={handleOpenModal}
          onToggleStatus={handleToggleStatus}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalItems={data?.total_items}
          isToggling={togglingUserId}
        />
      </div>

      {/* Modal Crear/Editar Usuario */}
      {showUserModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <UserForm
              key={editingUser?.id || "new"}
              user={editingUser || undefined}
              setShowUserModal={handleCloseModal}
              onSuccess={mutate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
