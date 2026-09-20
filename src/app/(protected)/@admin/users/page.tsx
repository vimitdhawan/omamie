import { getAllUsers } from "@/features/admin/users/service";
import { AdminUsersTable } from "@/features/admin/users/components/admin-users-table";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] leading-tight font-bold">
          User Management
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
          View tenants, owners, agents, and admins across the platform.
        </p>
      </div>

      <AdminUsersTable users={users} />
    </div>
  );
}
