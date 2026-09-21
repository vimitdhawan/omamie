import { getAllUsers } from "@/features/admin/users/service";
import { AdminUsersTable } from "@/features/admin/users/components/admin-users-table";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="flex-1 space-y-8 p-8">
      <AdminUsersTable users={users} />
    </div>
  );
}
