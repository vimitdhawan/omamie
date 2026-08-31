import { UserTable } from "@/features/admin/components/user-table";
import { getAllUsers } from "@/features/admin/service";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View all registered users ({users.length} total)
        </p>
      </div>

      {/* Users Table */}
      <UserTable users={users} />
    </div>
  );
}
